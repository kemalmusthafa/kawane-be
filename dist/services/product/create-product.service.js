"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const createProductService = async (input) => {
    const { name, description, price, sku, stock, categoryId, sizes, images } = input;
    // Business logic validation
    if (sku) {
        const existingSku = await prisma_1.default.product.findUnique({
            where: { sku },
        });
        if (existingSku)
            throw new Error("SKU already exists");
    }
    if (categoryId) {
        const category = await prisma_1.default.category.findUnique({
            where: { id: categoryId },
        });
        if (!category)
            throw new Error("Category not found");
    }
    // Calculate total stock from sizes if provided
    const totalStock = sizes && sizes.length > 0
        ? sizes.reduce((sum, size) => sum + size.stock, 0)
        : stock;
    // Create product
    const product = await prisma_1.default.$transaction(async (tx) => {
        const newProduct = await tx.product.create({
            data: {
                name,
                description,
                price,
                sku,
                stock: totalStock,
                categoryId,
                images: images
                    ? {
                        create: images.map((url) => ({ url })),
                    }
                    : undefined,
            },
            include: {
                category: true,
                images: true,
                sizes: true,
            },
        });
        // Create sizes if provided
        if (sizes && sizes.length > 0) {
            await tx.productSize.createMany({
                data: sizes.map((size) => ({
                    productId: newProduct.id,
                    size: size.size,
                    stock: size.stock,
                })),
            });
        }
        // Create inventory log for initial stock
        if (totalStock > 0) {
            await tx.inventoryLog.create({
                data: {
                    productId: newProduct.id,
                    change: totalStock,
                    note: "Initial stock",
                },
            });
        }
        return tx.product.findUnique({
            where: { id: newProduct.id },
            include: {
                category: true,
                images: true,
                sizes: true,
            },
        });
    });
    return product;
};
exports.createProductService = createProductService;
