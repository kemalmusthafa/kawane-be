"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInventoryLogService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const stock_monitoring_service_1 = require("./stock-monitoring.service");
const createInventoryLogService = async (input) => {
    const { productId, change, note } = input;
    // Check if product exists
    const product = await prisma_1.default.product.findUnique({
        where: { id: productId },
    });
    if (!product) {
        throw new Error("Product not found");
    }
    // Create inventory log
    const inventoryLog = await prisma_1.default.inventoryLog.create({
        data: {
            productId,
            change,
            note,
        },
        include: {
            product: {
                select: {
                    id: true,
                    name: true,
                    sku: true,
                    stock: true,
                },
            },
        },
    });
    // Update product stock
    const newStock = product.stock + change;
    if (newStock < 0) {
        throw new Error("Insufficient stock for this operation");
    }
    await prisma_1.default.product.update({
        where: { id: productId },
        data: { stock: newStock },
    });
    // 🔔 AUTOMATIC STOCK MONITORING & NOTIFICATION
    let monitoringResult = null;
    try {
        // Monitor stock level dan create notifications jika perlu
        monitoringResult = await stock_monitoring_service_1.StockMonitoringService.monitorSingleProduct(productId);
    }
    catch (error) {
        console.error("⚠️ Stock monitoring failed:", error);
        // Don't throw error, just log it
    }
    return {
        message: "Inventory log created successfully",
        log: {
            id: inventoryLog.id,
            productId: inventoryLog.productId,
            change: inventoryLog.change,
            note: inventoryLog.note,
            createdAt: inventoryLog.createdAt,
            product: {
                id: inventoryLog.product.id,
                name: inventoryLog.product.name,
                sku: inventoryLog.product.sku,
                oldStock: product.stock,
                newStock: newStock,
            },
        },
        monitoring: monitoringResult, // Include monitoring result
    };
};
exports.createInventoryLogService = createInventoryLogService;
