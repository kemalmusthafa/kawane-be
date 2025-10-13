"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCartService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const get_product_price_with_deal_service_1 = require("../deal/get-product-price-with-deal.service");
const getCartService = async (data) => {
    const { userId } = data;
    // Verify user exists
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!user)
        throw new Error("User not found");
    // Get user's cart with items
    const cart = await prisma_1.default.cart.findUnique({
        where: { userId },
        include: {
            items: {
                include: {
                    product: {
                        include: {
                            images: true,
                            category: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            },
        },
    });
    if (!cart) {
        // Create empty cart if doesn't exist
        const newCart = await prisma_1.default.cart.create({
            data: {
                userId,
            },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: true,
                                category: true,
                            },
                        },
                    },
                },
            },
        });
        return {
            cart: newCart,
            totalItems: 0,
            totalAmount: 0,
        };
    }
    // Calculate totals with deal pricing
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    // Get product prices with deals
    const productIds = cart.items.map((item) => item.productId);
    const productPrices = await (0, get_product_price_with_deal_service_1.getMultipleProductsPriceWithDeals)(productIds);
    // Create a map for quick lookup
    const priceMap = new Map(productPrices.map((price) => [price.productId, price]));
    // Calculate total amount using deal prices
    const totalAmount = cart.items.reduce((sum, item) => {
        const priceInfo = priceMap.get(item.productId);
        const price = priceInfo ? priceInfo.discountedPrice : item.product.price;
        return sum + price * item.quantity;
    }, 0);
    // Add deal information to cart items and filter out expired deals
    const cartItemsWithDeals = [];
    const expiredItems = [];
    for (const item of cart.items) {
        const priceInfo = priceMap.get(item.productId);
        // Check if deal is expired
        if (priceInfo && priceInfo.dealId) {
            const deal = await prisma_1.default.deal.findUnique({
                where: { id: priceInfo.dealId },
            });
            if (!deal || deal.status !== "ACTIVE" || deal.endDate < new Date()) {
                // Deal is expired, mark for removal
                expiredItems.push(item);
                continue;
            }
        }
        cartItemsWithDeals.push({
            ...item,
            product: {
                ...item.product,
                deal: priceInfo
                    ? {
                        id: priceInfo.dealId,
                        title: priceInfo.dealTitle,
                        originalPrice: priceInfo.originalPrice,
                        discountedPrice: priceInfo.discountedPrice,
                        discountAmount: priceInfo.discountAmount,
                        discountPercentage: priceInfo.discountPercentage,
                        isFlashSale: priceInfo.isFlashSale,
                        endDate: priceInfo.dealEndDate,
                    }
                    : null,
            },
        });
    }
    // Remove expired items from cart
    if (expiredItems.length > 0) {
        console.log(`🧹 Removing ${expiredItems.length} expired deal items from cart`);
        await prisma_1.default.cartItem.deleteMany({
            where: {
                id: { in: expiredItems.map((item) => item.id) },
            },
        });
    }
    return {
        cart: {
            ...cart,
            items: cartItemsWithDeals,
        },
        totalItems,
        totalAmount: Math.round(totalAmount * 100) / 100, // Round to 2 decimal places
    };
};
exports.getCartService = getCartService;
