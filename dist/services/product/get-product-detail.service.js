"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductDetailService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const getProductDetailService = async (params) => {
    const { productId, userId, includeDealSpecific = false } = params;
    const whereClause = { id: productId };
    // Only exclude deal-specific products for public API (not admin)
    if (!includeDealSpecific) {
        // Handle null values properly for NOT contains queries
        whereClause.AND = [
            {
                OR: [{ sku: null }, { NOT: { sku: { startsWith: "DEAL-" } } }],
            },
            {
                OR: [
                    { description: null },
                    { description: "" },
                    { NOT: { description: { contains: "DEAL SPECIAL" } } },
                ],
            },
            {
                OR: [
                    { description: null },
                    { description: "" },
                    { NOT: { description: { contains: "🎉" } } },
                ],
            },
            {
                OR: [
                    { description: null },
                    { description: "" },
                    { NOT: { description: { contains: "💰" } } },
                ],
            },
            {
                OR: [
                    { description: null },
                    { description: "" },
                    { NOT: { description: { contains: "🔥" } } },
                ],
            },
            {
                OR: [
                    { description: null },
                    { description: "" },
                    { NOT: { description: { contains: "💸" } } },
                ],
            },
        ];
    }
    const product = await prisma_1.default.product.findFirst({
        where: whereClause,
        include: {
            category: true,
            images: true,
            sizes: true, // Include sizes data
            reviews: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                take: 10,
            },
            _count: {
                select: {
                    reviews: true,
                    wishlist: true,
                },
            },
        },
    });
    if (!product)
        throw new Error("Product not found");
    let isInWishlist = false;
    if (userId) {
        const wishlistItem = await prisma_1.default.wishlist.findFirst({
            where: {
                userId,
                productId,
            },
        });
        isInWishlist = !!wishlistItem;
    }
    const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
            product.reviews.length
        : 0;
    const ratingDistribution = {
        5: product.reviews.filter((r) => r.rating === 5).length,
        4: product.reviews.filter((r) => r.rating === 4).length,
        3: product.reviews.filter((r) => r.rating === 3).length,
        2: product.reviews.filter((r) => r.rating === 2).length,
        1: product.reviews.filter((r) => r.rating === 1).length,
    };
    return {
        ...product,
        avgRating: Math.round(avgRating * 10) / 10,
        ratingDistribution,
        isInWishlist,
        totalReviews: product._count.reviews,
        totalWishlist: product._count.wishlist,
    };
};
exports.getProductDetailService = getProductDetailService;
