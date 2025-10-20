"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCartItemService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const updateCartItemService = async (data) => {
    const { userId, cartItemId, quantity } = data;
    if (quantity <= 0) {
        throw new Error("Quantity must be greater than 0");
    }
    // Verify user exists
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!user)
        throw new Error("User not found");
    // Get cart item with product info
    const cartItem = await prisma_1.default.cartItem.findUnique({
        where: { id: cartItemId },
        include: {
            cart: true,
            product: true,
        },
    });
    if (!cartItem) {
        throw new Error("Cart item not found");
    }
    // Verify cart belongs to user
    if (cartItem.cart.userId !== userId) {
        throw new Error("Unauthorized: Cart item does not belong to user");
    }
    // Check stock availability
    if (cartItem.product.stock < quantity) {
        throw new Error(`Insufficient stock. Available: ${cartItem.product.stock}`);
    }
    // Update cart item quantity
    const updatedItem = await prisma_1.default.cartItem.update({
        where: { id: cartItemId },
        data: { quantity },
        include: {
            product: {
                include: {
                    images: true,
                    category: true,
                },
            },
        },
    });
    return {
        message: "Cart item updated successfully",
        cartItem: updatedItem,
    };
};
exports.updateCartItemService = updateCartItemService;
