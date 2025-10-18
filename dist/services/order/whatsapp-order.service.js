"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWhatsAppOrdersService = exports.updateWhatsAppOrderStatusService = exports.createWhatsAppOrderService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const client_1 = require("../../../prisma/generated/client");
const whatsapp_order_notification_service_1 = require("../notification/whatsapp-order-notification.service");
const createWhatsAppOrderService = async (data) => {
    try {
        // Debug: Log incoming WhatsApp order data
        console.log("📱 Creating WhatsApp order with items:", data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
        })));
        // Validate user
        const user = await prisma_1.default.user.findUnique({
            where: { id: data.userId },
        });
        if (!user)
            throw new Error("User not found");
        // Validate products and calculate total
        const products = await prisma_1.default.product.findMany({
            where: {
                id: { in: data.items.map((item) => item.productId) },
            },
            include: {
                sizes: true, // Include product sizes for size-specific stock validation
            },
        });
        if (products.length !== data.items.length) {
            throw new Error("Some products not found");
        }
        // Calculate total amount
        let totalAmount = 0;
        const orderItems = [];
        for (const item of data.items) {
            const product = products.find((p) => p.id === item.productId);
            // 🔍 Enhanced stock validation - check size-specific stock if size is provided
            if (item.size) {
                // Check if product has sizes and find the specific size
                const productSize = product.sizes?.find((s) => s.size === item.size);
                if (!productSize) {
                    throw new Error(`Size "${item.size}" not available for ${product.name}`);
                }
                if (productSize.stock < item.quantity) {
                    throw new Error(`Insufficient stock for ${product.name} size ${item.size}. Available: ${productSize.stock}, Requested: ${item.quantity}`);
                }
            }
            else {
                // Check general stock if no size specified
                if (product.stock < item.quantity) {
                    throw new Error(`Insufficient stock for ${product.name}`);
                }
            }
            const itemTotal = product.price * item.quantity;
            totalAmount += itemTotal;
            orderItems.push({
                productId: item.productId,
                quantity: item.quantity,
                price: product.price,
                size: item.size, // ✅ Include size information
            });
        }
        // Generate unique WhatsApp order ID
        const whatsappOrderId = `WA-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`;
        // Create order
        const order = await prisma_1.default.$transaction(async (tx) => {
            // Create order
            const newOrder = await tx.order.create({
                data: {
                    userId: data.userId,
                    totalAmount: totalAmount,
                    whatsappPhoneNumber: data.whatsappPhoneNumber,
                    isWhatsAppOrder: true,
                    whatsappOrderId: whatsappOrderId,
                    adminNotes: data.notes || "",
                    status: client_1.OrderStatus.WHATSAPP_PENDING,
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
                    user: true,
                },
            });
            // Decrement stock
            for (const item of data.items) {
                // Decrement size-specific stock if size is provided
                if (item.size) {
                    await tx.productSize.updateMany({
                        where: {
                            productId: item.productId,
                            size: item.size,
                        },
                        data: {
                            stock: { decrement: item.quantity },
                        },
                    });
                }
                // Always decrement general product stock
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } },
                });
                await tx.inventoryLog.create({
                    data: {
                        productId: item.productId,
                        change: -item.quantity,
                        note: `WhatsApp Order ${newOrder.id}: Sale${item.size ? ` (Size: ${item.size})` : ""}`,
                    },
                });
            }
            // Create payment record
            await tx.payment.create({
                data: {
                    orderId: newOrder.id,
                    method: client_1.PaymentMethod.WHATSAPP_MANUAL,
                    amount: totalAmount,
                    whatsappPhoneNumber: data.whatsappPhoneNumber,
                    status: client_1.PaymentStatus.PENDING,
                },
            });
            return newOrder;
        });
        // Generate WhatsApp message
        const whatsappMessage = generateWhatsAppMessage(order, data.shippingAddress);
        // Update order with WhatsApp message
        await prisma_1.default.order.update({
            where: { id: order.id },
            data: { whatsappMessage: whatsappMessage },
        });
        // Create notifications
        await (0, whatsapp_order_notification_service_1.createWhatsAppOrderNotificationService)(order.id);
        return {
            order,
            whatsappMessage,
            whatsappLink: generateWhatsAppLink(data.whatsappPhoneNumber, whatsappMessage),
        };
    }
    catch (error) {
        console.error("Error creating WhatsApp order:", error);
        throw error;
    }
};
exports.createWhatsAppOrderService = createWhatsAppOrderService;
function generateWhatsAppMessage(order, shippingAddress) {
    const orderItems = order.items
        .map((item) => {
        // Enhanced size handling for WhatsApp messages
        let sizeText = "";
        if (item.size) {
            // If size is available (either original or determined), use it
            sizeText = ` (${item.size})`;
        }
        return `• ${item.product.name}${sizeText} x${item.quantity} = Rp ${(item.price * item.quantity).toLocaleString("id-ID")}`;
    })
        .join("\n");
    return `Halo! Saya ingin memesan produk dari Kawane Studio.

📋 Detail Pesanan:
${orderItems}

💰 Total: Rp ${order.totalAmount.toLocaleString("id-ID")}

📦 Alamat Pengiriman:
Nama: ${shippingAddress.name}
No. HP: ${shippingAddress.phone}
Alamat: ${shippingAddress.address}
Kota: ${shippingAddress.city}
Kode Pos: ${shippingAddress.postalCode}

📝 Order ID: ${order.whatsappOrderId}

Mohon konfirmasi ketersediaan dan cara pembayaran. Terima kasih! 🙏`;
}
function generateWhatsAppLink(phoneNumber, message) {
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}
const updateWhatsAppOrderStatusService = async (orderId, status, adminNotes) => {
    try {
        const order = await prisma_1.default.order.findUnique({
            where: { id: orderId },
            include: { payment: true, user: true },
        });
        if (!order)
            throw new Error("Order not found");
        const updatedOrder = await prisma_1.default.$transaction(async (tx) => {
            // Update order status
            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: {
                    status: status,
                    adminNotes: adminNotes || order.adminNotes,
                },
                include: {
                    payment: true,
                    user: true,
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
            });
            // Update payment status if order is confirmed
            if (status === client_1.OrderStatus.WHATSAPP_CONFIRMED) {
                await tx.payment.update({
                    where: { orderId: orderId },
                    data: {
                        status: client_1.PaymentStatus.SUCCEEDED,
                        adminConfirmed: true,
                    },
                });
            }
            return updatedOrder;
        });
        // Create notification for status update
        await (0, whatsapp_order_notification_service_1.createOrderStatusUpdateNotificationService)(orderId, status, adminNotes);
        return updatedOrder;
    }
    catch (error) {
        console.error("Error updating WhatsApp order status:", error);
        throw error;
    }
};
exports.updateWhatsAppOrderStatusService = updateWhatsAppOrderStatusService;
const getWhatsAppOrdersService = async (status) => {
    try {
        const orders = await prisma_1.default.order.findMany({
            where: {
                isWhatsAppOrder: true,
                ...(status && { status: status }),
            },
            include: {
                user: true,
                payment: true,
                items: {
                    include: {
                        product: true,
                    },
                },
                address: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return orders;
    }
    catch (error) {
        console.error("Error getting WhatsApp orders:", error);
        throw error;
    }
};
exports.getWhatsAppOrdersService = getWhatsAppOrdersService;
