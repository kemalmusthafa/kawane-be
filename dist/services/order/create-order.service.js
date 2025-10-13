"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const midtrans_service_1 = require("../payment/midtrans.service");
const get_product_price_with_deal_service_1 = require("../deal/get-product-price-with-deal.service");
const createOrderService = async (data) => {
    const user = await prisma_1.default.user.findUnique({
        where: { id: data.userId },
    });
    if (!user)
        throw new Error("User not found");
    // Handle address - if addressId is provided, use it; otherwise create a new address
    let addressId = data.addressId;
    let address = null;
    if (addressId && addressId !== "temp-address") {
        address = await prisma_1.default.address.findUnique({
            where: { id: addressId, userId: data.userId },
        });
        if (!address)
            throw new Error("Address not found");
    }
    else {
        // Create a temporary address for the order
        address = await prisma_1.default.address.create({
            data: {
                userId: data.userId,
                detail: "Temporary address for order",
                city: "Unknown",
                province: "Unknown",
                postalCode: "00000",
            },
        });
        addressId = address.id;
    }
    let discount = null;
    if (data.discountCode) {
        discount = await prisma_1.default.discount.findUnique({
            where: { code: data.discountCode },
        });
        if (!discount)
            throw new Error("Invalid discount code");
        const now = new Date();
        if (discount.validFrom && now < discount.validFrom) {
            throw new Error("Discount code not yet valid");
        }
        if (discount.validTo && now > discount.validTo) {
            throw new Error("Discount code has expired");
        }
        if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
            throw new Error("Discount code usage limit exceeded");
        }
    }
    const products = await prisma_1.default.product.findMany({
        where: {
            id: { in: data.items.map((item) => item.productId) },
        },
    });
    if (products.length !== data.items.length) {
        throw new Error("Some products not found");
    }
    // Get product prices with deals
    const productIds = data.items.map((item) => item.productId);
    const productPrices = await (0, get_product_price_with_deal_service_1.getMultipleProductsPriceWithDeals)(productIds);
    const priceMap = new Map(productPrices.map((price) => [price.productId, price]));
    const orderItems = [];
    let calculatedTotalAmount = 0;
    for (const item of data.items) {
        const product = products.find((p) => p.id === item.productId);
        const priceInfo = priceMap.get(item.productId);
        // 🔍 Enhanced stock validation
        if (product.stock < item.quantity) {
            throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
        }
        if (item.quantity <= 0) {
            throw new Error(`Invalid quantity for ${product.name}. Quantity must be greater than 0`);
        }
        // 🔍 Validate deal expiration
        if (priceInfo && priceInfo.dealId) {
            const deal = await prisma_1.default.deal.findUnique({
                where: { id: priceInfo.dealId },
            });
            if (!deal || deal.status !== "ACTIVE" || deal.endDate < new Date()) {
                throw new Error(`Deal for ${product.name} has expired. Please remove from cart and try again.`);
            }
        }
        // Use deal price if available, otherwise use original price
        const finalPrice = priceInfo ? priceInfo.discountedPrice : product.price;
        const itemTotal = finalPrice * item.quantity;
        calculatedTotalAmount += itemTotal;
        orderItems.push({
            productId: item.productId,
            quantity: item.quantity,
            price: finalPrice,
            originalPrice: priceInfo ? priceInfo.originalPrice : undefined,
            dealId: priceInfo?.dealId,
            dealTitle: priceInfo?.dealTitle,
            discountAmount: priceInfo ? priceInfo.discountAmount : 0,
            discountPercentage: priceInfo ? priceInfo.discountPercentage : 0,
        });
    }
    // Use provided totalAmount if available, otherwise use calculated amount
    console.log("=== CREATE ORDER SERVICE DEBUG ===");
    console.log("Provided totalAmount:", data.totalAmount);
    console.log("Calculated totalAmount:", calculatedTotalAmount);
    console.log("Using provided totalAmount?", !!data.totalAmount);
    console.log("===================================");
    const totalAmount = data.totalAmount || calculatedTotalAmount;
    let finalAmount = totalAmount;
    if (discount) {
        if (discount.percentage) {
            finalAmount = totalAmount * (1 - discount.percentage / 100);
        }
        else if (discount.amount) {
            finalAmount = Math.max(0, totalAmount - discount.amount);
        }
    }
    const order = await prisma_1.default.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
            data: {
                userId: data.userId,
                addressId: addressId,
                totalAmount: finalAmount,
                items: {
                    create: orderItems,
                },
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                address: true,
                user: true,
            },
        });
        for (const item of data.items) {
            await tx.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: item.quantity } },
            });
            await tx.inventoryLog.create({
                data: {
                    productId: item.productId,
                    change: -item.quantity,
                    note: `Order ${newOrder.id}: Sale`,
                },
            });
        }
        if (discount) {
            await tx.discount.update({
                where: { id: discount.id },
                data: { usedCount: { increment: 1 } },
            });
        }
        return newOrder;
    });
    // Create Midtrans payment
    let paymentUrl = null;
    let paymentToken = null;
    console.log("=== STARTING MIDTRANS INTEGRATION ===");
    console.log("Order created successfully:", order.id);
    console.log("Order total amount:", order.totalAmount);
    try {
        const midtransData = {
            orderId: order.id,
            amount: order.totalAmount,
            customerDetails: {
                firstName: user.name.split(" ")[0] || user.name,
                lastName: user.name.split(" ").slice(1).join(" ") || "",
                email: user.email,
                phone: user.phone || "08123456789",
            },
            shippingAddress: {
                firstName: user.name.split(" ")[0] || user.name,
                lastName: user.name.split(" ").slice(1).join(" ") || "",
                address: address.detail,
                city: address.city,
                postalCode: address.postalCode || "00000",
                phone: user.phone || "08123456789",
            },
            itemDetails: order.items.map((item) => ({
                id: item.productId,
                price: item.price,
                quantity: item.quantity,
                name: item.product.name.length > 50
                    ? item.product.name.substring(0, 47) + "..."
                    : item.product.name,
            })),
        };
        // Validate amount calculation
        const calculatedTotal = midtransData.itemDetails.reduce((sum, item) => sum + item.price * item.quantity, 0);
        console.log("=== MIDTRANS INTEGRATION ===");
        console.log("Order ID:", order.id);
        console.log("Total Amount:", order.totalAmount);
        console.log("Calculated Total:", calculatedTotal);
        console.log("Amount Match:", order.totalAmount === calculatedTotal);
        console.log("Midtrans data:", JSON.stringify(midtransData, null, 2));
        // Ensure amount calculation is correct
        if (order.totalAmount !== calculatedTotal) {
            console.error("Amount mismatch detected!");
            console.error("Order total:", order.totalAmount);
            console.error("Calculated total:", calculatedTotal);
            throw new Error(`Amount mismatch: Order total (${order.totalAmount}) does not match calculated total (${calculatedTotal})`);
        }
        const midtransResponse = await midtrans_service_1.MidtransService.createPayment(midtransData);
        paymentUrl = midtransResponse.redirectUrl;
        paymentToken = midtransResponse.token;
        console.log("Midtrans response:", midtransResponse);
        console.log("==========================");
        // Create payment record in database
        const payment = await prisma_1.default.payment.create({
            data: {
                orderId: order.id,
                method: "MIDTRANS",
                amount: order.totalAmount,
                snapToken: midtransResponse.token,
                snapRedirectUrl: midtransResponse.redirectUrl,
                status: "PENDING",
            },
        });
        console.log("✅ Payment record created:", payment.id);
    }
    catch (error) {
        console.error("=== MIDTRANS ERROR ===");
        console.error("Failed to create Midtrans payment:", error);
        console.error("Error details:", error);
        console.error("=====================");
        // Even if Midtrans fails, we should still create a payment record
        try {
            const payment = await prisma_1.default.payment.create({
                data: {
                    orderId: order.id,
                    method: "MIDTRANS",
                    amount: order.totalAmount,
                    status: "PENDING",
                },
            });
            console.log("✅ Payment record created (fallback):", payment.id);
        }
        catch (paymentError) {
            console.error("❌ Failed to create payment record:", paymentError);
        }
    }
    return {
        ...order,
        paymentUrl,
        paymentToken,
    };
};
exports.createOrderService = createOrderService;
