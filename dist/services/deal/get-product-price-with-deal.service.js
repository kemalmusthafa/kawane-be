"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMultipleProductsPriceWithDeals = exports.getProductPriceWithDeal = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const getProductPriceWithDeal = async (productId) => {
    const product = await prisma_1.default.product.findUnique({
        where: { id: productId },
        include: {
            dealProducts: {
                include: {
                    deal: true,
                },
                where: {
                    deal: {
                        status: "ACTIVE",
                        startDate: { lte: new Date() },
                        endDate: { gte: new Date() },
                    },
                },
            },
        },
    });
    if (!product) {
        throw new Error("Product not found");
    }
    // Check if product is already discounted (has DEAL- prefix in SKU or DEAL SPECIAL in description)
    const isAlreadyDiscounted = product.sku?.startsWith("DEAL-") ||
        product.description?.includes("DEAL SPECIAL");
    // If product is already discounted, calculate original price and discount info
    if (isAlreadyDiscounted) {
        // For products already discounted, we need to calculate the original price
        // Assuming 10% discount was applied (this should be configurable)
        const discountPercentage = 10; // This should come from deal info or be configurable
        const originalPrice = Math.round(product.price / (1 - discountPercentage / 100));
        const discountAmount = originalPrice - product.price;
        return {
            productId: product.id,
            originalPrice: originalPrice,
            discountedPrice: product.price,
            discountAmount: discountAmount,
            discountPercentage: discountPercentage,
            isFlashSale: false,
        };
    }
    const activeDeal = product.dealProducts.find((dp) => dp.deal)?.deal;
    if (!activeDeal) {
        return {
            productId: product.id,
            originalPrice: product.price,
            discountedPrice: product.price,
            discountAmount: 0,
            discountPercentage: 0,
            isFlashSale: false,
        };
    }
    let discountedPrice = product.price;
    let discountAmount = 0;
    let discountPercentage = 0;
    if (activeDeal.type === "PERCENTAGE") {
        discountAmount = (product.price * activeDeal.value) / 100;
        discountedPrice = product.price - discountAmount;
        discountPercentage = activeDeal.value;
    }
    else if (activeDeal.type === "FIXED_AMOUNT") {
        discountAmount = activeDeal.value;
        discountedPrice = Math.max(0, product.price - activeDeal.value);
        discountPercentage = Math.round((discountAmount / product.price) * 100);
    }
    else if (activeDeal.type === "FLASH_SALE") {
        discountedPrice = activeDeal.value;
        discountAmount = product.price - activeDeal.value;
        discountPercentage = Math.round((discountAmount / product.price) * 100);
    }
    return {
        productId: product.id,
        originalPrice: product.price,
        discountedPrice: Math.round(discountedPrice * 100) / 100,
        dealId: activeDeal.id,
        dealTitle: activeDeal.title,
        discountAmount: Math.round(discountAmount * 100) / 100,
        discountPercentage,
        isFlashSale: activeDeal.isFlashSale,
        dealEndDate: activeDeal.endDate,
    };
};
exports.getProductPriceWithDeal = getProductPriceWithDeal;
const getMultipleProductsPriceWithDeals = async (productIds) => {
    const products = await prisma_1.default.product.findMany({
        where: { id: { in: productIds } },
        include: {
            dealProducts: {
                include: {
                    deal: true,
                },
                where: {
                    deal: {
                        status: "ACTIVE",
                        startDate: { lte: new Date() },
                        endDate: { gte: new Date() },
                    },
                },
            },
        },
    });
    return products.map((product) => {
        // Check if product is already discounted (has DEAL- prefix in SKU or DEAL SPECIAL in description)
        const isAlreadyDiscounted = product.sku?.startsWith("DEAL-") ||
            product.description?.includes("DEAL SPECIAL");
        // If product is already discounted, calculate original price and discount info
        if (isAlreadyDiscounted) {
            // For products already discounted, we need to calculate the original price
            // Assuming 10% discount was applied (this should be configurable)
            const discountPercentage = 10; // This should come from deal info or be configurable
            const originalPrice = Math.round(product.price / (1 - discountPercentage / 100));
            const discountAmount = originalPrice - product.price;
            return {
                productId: product.id,
                originalPrice: originalPrice,
                discountedPrice: product.price,
                discountAmount: discountAmount,
                discountPercentage: discountPercentage,
                isFlashSale: false,
            };
        }
        const activeDeal = product.dealProducts.find((dp) => dp.deal)?.deal;
        if (!activeDeal) {
            return {
                productId: product.id,
                originalPrice: product.price,
                discountedPrice: product.price,
                discountAmount: 0,
                discountPercentage: 0,
                isFlashSale: false,
            };
        }
        let discountedPrice = product.price;
        let discountAmount = 0;
        let discountPercentage = 0;
        if (activeDeal.type === "PERCENTAGE") {
            discountAmount = (product.price * activeDeal.value) / 100;
            discountedPrice = product.price - discountAmount;
            discountPercentage = activeDeal.value;
        }
        else if (activeDeal.type === "FIXED_AMOUNT") {
            discountAmount = activeDeal.value;
            discountedPrice = Math.max(0, product.price - activeDeal.value);
            discountPercentage = Math.round((discountAmount / product.price) * 100);
        }
        else if (activeDeal.type === "FLASH_SALE") {
            discountedPrice = activeDeal.value;
            discountAmount = product.price - activeDeal.value;
            discountPercentage = Math.round((discountAmount / product.price) * 100);
        }
        return {
            productId: product.id,
            originalPrice: product.price,
            discountedPrice: Math.round(discountedPrice * 100) / 100,
            dealId: activeDeal.id,
            dealTitle: activeDeal.title,
            discountAmount: Math.round(discountAmount * 100) / 100,
            discountPercentage,
            isFlashSale: activeDeal.isFlashSale,
            dealEndDate: activeDeal.endDate,
        };
    });
};
exports.getMultipleProductsPriceWithDeals = getMultipleProductsPriceWithDeals;
