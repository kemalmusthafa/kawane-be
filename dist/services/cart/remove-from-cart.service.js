"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFromCartService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const removeFromCartService = async (data) => {
    const { userId, cartItemId } = data;
    // Debug: Log the request
    console.log("🗑️ Remove from cart request:", { userId, cartItemId });
    // Verify user exists
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!user)
        throw new Error("User not found");
    // Get cart item with cart info
    const cartItem = await prisma_1.default.cartItem.findUnique({
        where: { id: cartItemId },
        include: {
            cart: true,
            product: {
                include: {
                    images: true,
                    category: true,
                },
            },
        },
    });
    console.log("🔍 Cart item lookup result:", cartItem ? "Found" : "Not found");
    if (!cartItem) {
        console.log("❌ Cart item not found for ID:", cartItemId);
        throw new Error("Cart item not found");
    }
    // Verify cart belongs to user
    if (cartItem.cart.userId !== userId) {
        throw new Error("Unauthorized: Cart item does not belong to user");
    }
    // Remove cart item
    await prisma_1.default.cartItem.delete({
        where: { id: cartItemId },
    });
    return {
        message: "Item removed from cart successfully",
        removedItem: {
            id: cartItem.id,
            product: cartItem.product,
            quantity: cartItem.quantity,
        },
    };
};
exports.removeFromCartService = removeFromCartService;
