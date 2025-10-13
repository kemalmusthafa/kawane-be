"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStockService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const updateStockService = async (data) => {
    const product = await prisma_1.default.product.findUnique({
        where: { id: data.productId },
    });
    if (!product)
        throw new Error("Product not found");
    const newStock = product.stock + data.change;
    if (newStock < 0)
        throw new Error("Stock cannot be negative");
    const [updatedProduct, inventoryLog] = await prisma_1.default.$transaction([
        prisma_1.default.product.update({
            where: { id: data.productId },
            data: { stock: newStock },
        }),
        prisma_1.default.inventoryLog.create({
            data: {
                productId: data.productId,
                change: data.change,
                note: data.note ||
                    `${data.type}: ${data.change > 0 ? "+" : ""}${data.change}`,
            },
        }),
    ]);
    return {
        product: updatedProduct,
        inventoryLog,
        previousStock: product.stock,
        newStock,
    };
};
exports.updateStockService = updateStockService;
