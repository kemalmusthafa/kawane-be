"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReviewService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const createReviewService = async (data) => {
    if (data.rating < 1 || data.rating > 5) {
        throw new Error("Rating must be between 1 and 5");
    }
    const user = await prisma_1.default.user.findUnique({
        where: { id: data.userId },
    });
    if (!user)
        throw new Error("User not found");
    const product = await prisma_1.default.product.findUnique({
        where: { id: data.productId },
    });
    if (!product)
        throw new Error("Product not found");
    const existingReview = await prisma_1.default.review.findFirst({
        where: {
            userId: data.userId,
            productId: data.productId,
        },
    });
    const hasPurchased = await prisma_1.default.orderItem.findFirst({
        where: {
            productId: data.productId,
            order: {
                userId: data.userId,
                status: {
                    in: ["COMPLETED", "PAID", "SHIPPED"],
                },
            },
        },
    });
    if (!hasPurchased)
        throw new Error("You can only review products you have purchased (order must be PAID, SHIPPED, or COMPLETED)");
    let review;
    if (existingReview) {
        // Update existing review
        review = await prisma_1.default.review.update({
            where: {
                id: existingReview.id,
            },
            data: {
                rating: data.rating,
                comment: data.comment,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
                product: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }
    else {
        // Create new review
        review = await prisma_1.default.review.create({
            data: {
                userId: data.userId,
                productId: data.productId,
                rating: data.rating,
                comment: data.comment,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
                product: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }
    return review;
};
exports.createReviewService = createReviewService;
