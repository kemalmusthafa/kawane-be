"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCartService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const clearCartService = async (data) => {
    const { userId } = data;
    // Verify user exists
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!user)
        throw new Error("User not found");
    // Get user's cart
    const cart = await prisma_1.default.cart.findUnique({
        where: { userId },
        include: {
            items: true,
        },
    });
    if (!cart) {
        return {
            message: "Cart is already empty",
            clearedItems: 0,
        };
    }
    // Count items before clearing
    const itemCount = cart.items.length;
    // Clear all cart items
    await prisma_1.default.cartItem.deleteMany({
        where: { cartId: cart.id },
    });
    return {
        message: "Cart cleared successfully",
        clearedItems: itemCount,
    };
};
exports.clearCartService = clearCartService;
