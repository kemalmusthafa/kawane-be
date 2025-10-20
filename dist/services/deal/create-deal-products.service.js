"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDealProductsService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const createDealProductsService = async (data) => {
    const { dealId, originalProductIds } = data;
    // Get deal information
    const deal = await prisma_1.default.deal.findUnique({
        where: { id: dealId },
    });
    if (!deal) {
        throw new Error("Deal not found");
    }
    // Get original products
    const originalProducts = await prisma_1.default.product.findMany({
        where: { id: { in: originalProductIds } },
        include: {
            images: true,
            category: true,
        },
    });
    if (originalProducts.length === 0) {
        throw new Error("No products found");
    }
    const dealProducts = [];
    for (const originalProduct of originalProducts) {
        // Check if this product is already in a deal
        const existingDealProduct = await prisma_1.default.dealProduct.findFirst({
            where: {
                productId: originalProduct.id,
                deal: {
                    status: "ACTIVE",
                    startDate: { lte: new Date() },
                    endDate: { gte: new Date() },
                },
            },
        });
        if (existingDealProduct) {
            throw new Error(`Product "${originalProduct.name}" is already in an active deal`);
        }
        // Create DealProduct relationship (NO NEW PRODUCT CREATED)
        const dealProductRelation = await prisma_1.default.dealProduct.create({
            data: {
                dealId: deal.id,
                productId: originalProduct.id,
            },
        });
        dealProducts.push({
            ...originalProduct,
            dealProductRelation,
        });
    }
    return {
        message: "Deal products created successfully",
        dealProducts,
        dealInfo: {
            dealId: deal.id,
            dealTitle: deal.title,
            originalProductCount: originalProducts.length,
            createdProductCount: dealProducts.length,
        },
    };
};
exports.createDealProductsService = createDealProductsService;
