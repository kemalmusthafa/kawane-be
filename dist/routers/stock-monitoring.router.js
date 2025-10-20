"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockMonitoringRouter = void 0;
const express_1 = require("express");
const stock_monitoring_controller_1 = require("../controllers/stock-monitoring.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const zod_validation_middleware_1 = require("../middlewares/zod-validation.middleware");
const validation_schemas_1 = require("../utils/validation-schemas");
class StockMonitoringRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.stockMonitoringController = new stock_monitoring_controller_1.StockMonitoringController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Run stock monitoring for all products (Admin only)
        this.router.post("/run-monitoring", auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, this.stockMonitoringController.runStockMonitoringController);
        // Run stock monitoring for specific product (Admin only)
        this.router.post("/run-monitoring/:productId", auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, (0, zod_validation_middleware_1.validateParams)(validation_schemas_1.productIdParamSchema), this.stockMonitoringController.runSingleProductMonitoringController);
    }
    getRouter() {
        return this.router;
    }
}
exports.StockMonitoringRouter = StockMonitoringRouter;
