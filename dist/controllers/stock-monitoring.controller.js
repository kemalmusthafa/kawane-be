"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockMonitoringController = void 0;
const stock_cron_service_1 = require("../services/inventory/stock-cron.service");
const stock_monitoring_service_1 = require("../services/inventory/stock-monitoring.service");
const async_handler_middleware_1 = require("../middlewares/async-handler.middleware");
class StockMonitoringController {
    /**
     * Jalankan stock monitoring untuk semua produk
     */
    async runStockMonitoringController(req, res) {
        try {
            await stock_cron_service_1.StockCronService.manualTrigger();
            (0, async_handler_middleware_1.successResponse)(res, { success: true }, "Stock monitoring completed successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
    /**
     * Jalankan stock monitoring untuk produk tertentu
     */
    async runSingleProductMonitoringController(req, res) {
        try {
            const { productId } = req.params;
            if (!productId) {
                return (0, async_handler_middleware_1.errorResponse)(res, "Product ID is required", 400);
            }
            const result = await stock_monitoring_service_1.StockMonitoringService.monitorSingleProduct(productId);
            (0, async_handler_middleware_1.successResponse)(res, result, "Single product monitoring completed successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
    /**
     * Get stock summary untuk dashboard
     */
    async getStockSummaryController(req, res) {
        try {
            const result = await stock_monitoring_service_1.StockMonitoringService.getStockSummary();
            (0, async_handler_middleware_1.successResponse)(res, result, "Stock summary retrieved successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
    /**
     * Get low stock products
     */
    async getLowStockProductsController(req, res) {
        try {
            const queryData = req.validatedQuery || req.query;
            const { page = 1, limit = 10 } = queryData;
            // Get products with low stock
            const products = await stock_monitoring_service_1.StockMonitoringService.getLowStockProducts({
                page: parseInt(page),
                limit: parseInt(limit),
            });
            (0, async_handler_middleware_1.successResponse)(res, products, "Low stock products retrieved successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
}
exports.StockMonitoringController = StockMonitoringController;
