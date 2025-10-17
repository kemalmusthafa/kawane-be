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
    if (data.size !== undefined)
        updateData.size = data.size;
    const updatedProduct = await prisma_1.default.product.update({
        where: { id: data.id },
        data: updateData,
        include: {
            category: true,
            images: true,
        },
    });
    if (data.images) {
        await prisma_1.default.productImage.deleteMany({
            where: { productId: data.id },
        });
        if (data.images.length > 0) {
            await prisma_1.default.productImage.createMany({
                data: data.images.map((url) => ({
                    productId: data.id,
                    url,
                })),
            });
        }
    }
    if (data.stock !== undefined && data.stock !== product.stock) {
        const change = data.stock - product.stock;
        await prisma_1.default.inventoryLog.create({
            data: {
                productId: data.id,
                change,
                note: `Stock adjustment: ${change > 0 ? "+" : ""}${change}`,
            },
        });
    }
    return updatedProduct;
};
exports.updateProductService = updateProductService;
