"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWishlistService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const getWishlistService = async (data) => {
    const { userId } = data;
    // Verify user exists
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!user)
        throw new Error("User not found");
    // Get user's wishlist with products
    const wishlist = await prisma_1.default.wishlist.findMany({
        where: { userId },
        include: {
            product: {
                include: {
                    images: true,
                    category: true,
                    _count: {
                        select: {
                            reviews: true,
                            wishlist: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    return {
        wishlist,
        totalItems: wishlist.length,
    };
};
exports.getWishlistService = getWishlistService;
