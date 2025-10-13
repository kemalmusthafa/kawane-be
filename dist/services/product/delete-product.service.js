"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const deleteProductService = async (data) => {
    const product = await prisma_1.default.product.findUnique({
        where: { id: data.id },
        include: {
            _count: {
                select: {
                    orderItems: true,
                    cartItems: true,
                    wishlist: true,
                    reviews: true,
                },
            },
        },
    });
    if (!product) {
        throw new Error("Product not found");
    }
    // Check if product has any dependencies
    const hasDependencies = product._count.orderItems > 0 ||
        product._count.cartItems > 0 ||
        product._count.wishlist > 0 ||
        product._count.reviews > 0;
    if (hasDependencies) {
        throw new Error("Cannot delete product that has orders, cart items, wishlist entries, or reviews. " +
            "Please handle these dependencies first or consider archiving the product instead.");
    }
    // Delete product images first
    await prisma_1.default.productImage.deleteMany({
        where: { productId: data.id },
    });
    // Delete inventory logs
    await prisma_1.default.inventoryLog.deleteMany({
        where: { productId: data.id },
    });
    // Delete the product
    await prisma_1.default.product.delete({
        where: { id: data.id },
    });
    return { message: "Product deleted successfully" };
};
exports.deleteProductService = deleteProductService;
