"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDealToCartService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const addDealToCartService = async (data) => {
    const { userId, dealId, productId, quantity } = data;
    if (quantity <= 0) {
        throw new Error("Quantity must be greater than 0");
    }
    // Verify user exists
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!user)
        throw new Error("User not found");
    // Verify deal exists and is active
    const deal = await prisma_1.default.deal.findUnique({
        where: { id: dealId },
        include: {
            dealProducts: {
                where: { productId },
            },
        },
    });
    if (!deal)
        throw new Error("Deal not found");
    if (deal.status !== "ACTIVE")
        throw new Error("Deal is not active");
    // Check if current time is within deal period
    const now = new Date();
    if (now < deal.startDate || now > deal.endDate) {
        throw new Error("Deal is not currently active");
    }
    // Check if product is part of this deal
    if (deal.dealProducts.length === 0) {
        throw new Error("Product is not part of this deal");
    }
    // Verify product exists and has stock
    const product = await prisma_1.default.product.findUnique({
        where: { id: productId },
    });
    if (!product)
        throw new Error("Product not found");
    if (product.stock < quantity) {
        throw new Error(`Insufficient stock. Available: ${product.stock}`);
    }
    // Calculate discounted price
    let discountedPrice = product.price;
    let discountAmount = 0;
    let discountType = deal.type;
    if (deal.type === "PERCENTAGE") {
        discountAmount = (product.price * deal.value) / 100;
        discountedPrice = product.price - discountAmount;
    }
    else if (deal.type === "FIXED_AMOUNT") {
        discountAmount = deal.value;
        discountedPrice = Math.max(0, product.price - deal.value);
    }
    else if (deal.type === "FLASH_SALE") {
        // Flash sale uses the value as the final price
        discountedPrice = deal.value;
        discountAmount = product.price - deal.value;
    }
    // Get or create user's cart
    let cart = await prisma_1.default.cart.findUnique({
        where: { userId },
        include: {
            items: {
                include: {
                    product: {
                        include: {
                            images: true,
                        },
                    },
                },
            },
        },
    });
    if (!cart) {
        cart = await prisma_1.default.cart.create({
            data: {
                userId,
            },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: true,
                            },
                        },
                    },
                },
            },
        });
    }
    // Check if product already exists in cart
    const existingItem = cart.items.find((item) => item.productId === productId);
    if (existingItem) {
        // Update quantity if item already exists
        const newQuantity = existingItem.quantity + quantity;
        if (product.stock < newQuantity) {
            throw new Error(`Insufficient stock. Available: ${product.stock}, Requested: ${newQuantity}`);
        }
        const updatedItem = await prisma_1.default.cartItem.update({
            where: { id: existingItem.id },
            data: {
                quantity: newQuantity,
            },
            include: {
                product: {
                    include: {
                        images: true,
                    },
                },
            },
        });
        return {
            message: "Cart item quantity updated successfully with deal discount",
            cartItem: updatedItem,
            dealInfo: {
                dealId: deal.id,
                dealTitle: deal.title,
                originalPrice: product.price,
                discountedPrice: discountedPrice,
                discountAmount: discountAmount,
                discountType: discountType,
            },
        };
    }
    else {
        // Add new item to cart with deal discount
        const newItem = await prisma_1.default.cartItem.create({
            data: {
                cartId: cart.id,
                productId,
                quantity,
            },
            include: {
                product: {
                    include: {
                        images: true,
                    },
                },
            },
        });
        return {
            message: "Item added to cart successfully with deal discount",
            cartItem: newItem,
            dealInfo: {
                dealId: deal.id,
                dealTitle: deal.title,
                originalPrice: product.price,
                discountedPrice: discountedPrice,
                discountAmount: discountAmount,
                discountType: discountType,
            },
        };
    }
};
exports.addDealToCartService = addDealToCartService;
