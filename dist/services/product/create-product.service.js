"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const createProductService = async (input) => {
    const { name, description, price, sku, stock, categoryId, images } = input;
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
    // Create product
    const product = await prisma_1.default.product.create({
        data: {
            name,
            description,
            price,
            sku,
            stock,
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
        },
    });
    // Create inventory log for initial stock
    if (stock > 0) {
        await prisma_1.default.inventoryLog.create({
            data: {
                productId: product.id,
                change: stock,
                note: "Initial stock",
            },
        });
    }
    return product;
};
exports.createProductService = createProductService;
