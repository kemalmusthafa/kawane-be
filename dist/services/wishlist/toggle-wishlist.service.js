"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleWishlistService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const toggleWishlistService = async (data) => {
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
    const existingWishlist = await prisma_1.default.wishlist.findFirst({
        where: {
            userId: data.userId,
            productId: data.productId,
        },
    });
    if (existingWishlist) {
        await prisma_1.default.wishlist.delete({
            where: { id: existingWishlist.id },
        });
        return { action: "removed", message: "Product removed from wishlist" };
    }
    else {
        await prisma_1.default.wishlist.create({
            data: {
                userId: data.userId,
                productId: data.productId,
            },
        });
        return { action: "added", message: "Product added to wishlist" };
    }
};
exports.toggleWishlistService = toggleWishlistService;
