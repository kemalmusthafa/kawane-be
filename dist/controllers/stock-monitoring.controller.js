"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockMonitoringController = void 0;
const stock_monitoring_service_1 = require("../services/inventory/stock-monitoring.service");
const prisma_1 = __importDefault(require("../prisma"));
const async_handler_middleware_1 = require("../middlewares/async-handler.middleware");
class StockMonitoringController {
    // Manual trigger untuk monitor semua products
    async monitorAllProductsController(req, res) {
        try {
            const result = await stock_monitoring_service_1.StockMonitoringService.monitorAllProducts();
            (0, async_handler_middleware_1.successResponse)(res, result, "Stock monitoring completed");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
    // Get stock summary untuk dashboard
    async getStockSummaryController(req, res) {
        try {
            const result = await stock_monitoring_service_1.StockMonitoringService.getStockSummary();
            (0, async_handler_middleware_1.successResponse)(res, result, "Stock summary retrieved");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
    // Get products dengan low stock
    async getLowStockProductsController(req, res) {
        try {
            // Use validated query data if available, otherwise fallback to req.query
            const queryData = req.validatedQuery || req.query;
            const { page = 1, limit = 10, status } = queryData;
            const skip = (parseInt(page) - 1) * parseInt(limit);
            // Build where clause berdasarkan status
            const where = {};
            if (status === "low") {
                where.stock = {
                    lte: 10,
                    gt: 5,
                };
            }
            else if (status === "critical") {
                where.stock = {
                    lte: 5,
                    gt: 0,
                };
            }
            else if (status === "out_of_stock") {
                where.stock = 0;
            }
            else {
                // Default: semua low stock (≤ 10)
                where.stock = {
                    lte: 10,
                };
            }
            const [products, total] = await Promise.all([
                prisma_1.default.product.findMany({
                    where,
                    include: {
                        category: {
                            select: {
                                name: true,
                            },
                        },
                    },
                    orderBy: {
                        stock: "asc",
                    },
                    skip,
                    take: parseInt(limit),
                }),
                prisma_1.default.product.count({ where }),
            ]);
            // Add stock status to each product
            const productsWithStatus = products.map((product) => ({
                ...product,
                stockStatus: stock_monitoring_service_1.StockMonitoringService.getStockStatus(product.stock),
            }));
            const totalPages = Math.ceil(total / parseInt(limit));
            (0, async_handler_middleware_1.successResponse)(res, {
                products: productsWithStatus,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages,
                    hasNextPage: parseInt(page) < totalPages,
                    hasPrevPage: parseInt(page) > 1,
                },
            }, "Low stock products retrieved");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
}
exports.StockMonitoringController = StockMonitoringController;
