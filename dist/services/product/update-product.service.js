"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const updateProductService = async (data) => {
    const product = await prisma_1.default.product.findUnique({
        where: { id: data.id },
        include: {
            sizes: true,
        },
    });
    if (!product)
        throw new Error("Product not found");
    if (data.price !== undefined && data.price <= 0) {
        throw new Error("Price must be greater than 0");
    }
    if (data.stock !== undefined && data.stock < 0) {
        throw new Error("Stock cannot be negative");
    }
    if (data.sku && data.sku !== product.sku) {
        const existingSku = await prisma_1.default.product.findUnique({
            where: { sku: data.sku },
        });
        if (existingSku)
            throw new Error("SKU already exists");
    }
    if (data.categoryId) {
        const category = await prisma_1.default.category.findUnique({
            where: { id: data.categoryId },
        });
        if (!category)
            throw new Error("Category not found");
    }
    const updateData = {};
    if (data.name !== undefined)
        updateData.name = data.name;
    if (data.description !== undefined)
        updateData.description = data.description;
    if (data.price !== undefined)
        updateData.price = data.price;
    if (data.sku !== undefined)
        updateData.sku = data.sku;
    if (data.stock !== undefined)
        updateData.stock = data.stock;
    if (data.categoryId !== undefined)
        updateData.categoryId = data.categoryId;
    const updatedProduct = await prisma_1.default.$transaction(async (tx) => {
        // Update basic product data
        const product = await tx.product.update({
            where: { id: data.id },
            data: updateData,
            include: {
                category: true,
                images: true,
                sizes: true,
            },
        });
        // Handle sizes update
        if (data.sizes !== undefined) {
            // Delete existing sizes
            await tx.productSize.deleteMany({
                where: { productId: data.id },
            });
            // Create new sizes
            if (data.sizes.length > 0) {
                await tx.productSize.createMany({
                    data: data.sizes.map((size) => ({
                        productId: data.id,
                        size: size.size,
                        stock: size.stock,
                    })),
                });
            }
            // Update total stock based on sizes
            const totalStock = data.sizes.reduce((sum, size) => sum + size.stock, 0);
            await tx.product.update({
                where: { id: data.id },
                data: { stock: totalStock },
            });
        }
        // Handle images update
        if (data.images !== undefined) {
            await tx.productImage.deleteMany({
                where: { productId: data.id },
            });
            if (data.images.length > 0) {
                await tx.productImage.createMany({
                    data: data.images.map((url) => ({
                        productId: data.id,
                        url,
                    })),
                });
            }
        }
        // Handle stock change logging
        if (data.stock !== undefined && data.stock !== product.stock) {
            const change = data.stock - product.stock;
            await tx.inventoryLog.create({
                data: {
                    productId: data.id,
                    change,
                    note: `Stock adjustment: ${change > 0 ? "+" : ""}${change}`,
                },
            });
        }
        return tx.product.findUnique({
            where: { id: data.id },
            include: {
                category: true,
                images: true,
                sizes: true,
            },
        });
    });
    return updatedProduct;
};
exports.updateProductService = updateProductService;
