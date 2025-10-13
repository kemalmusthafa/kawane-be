"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryRouter = void 0;
const express_1 = require("express");
const inventory_controller_1 = require("../controllers/inventory.controller");
const stock_monitoring_controller_1 = require("../controllers/stock-monitoring.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const zod_validation_middleware_1 = require("../middlewares/zod-validation.middleware");
const validation_schemas_1 = require("../utils/validation-schemas");
class InventoryRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.inventoryController = new inventory_controller_1.InventoryController();
        this.stockMonitoringController = new stock_monitoring_controller_1.StockMonitoringController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Get inventory summary (Staff/Admin only)
        this.router.get("/summary", auth_middleware_1.requireAuth, auth_middleware_1.requireStaff, this.inventoryController.getInventorySummaryController);
        // Get inventory logs with pagination and filtering (Staff/Admin only)
        this.router.get("/logs", auth_middleware_1.requireAuth, auth_middleware_1.requireStaff, (0, zod_validation_middleware_1.validateQuery)(validation_schemas_1.inventoryLogQuerySchema), this.inventoryController.getInventoryLogsController);
        // Create inventory log (Staff/Admin only)
        this.router.post("/logs", auth_middleware_1.requireAuth, auth_middleware_1.requireStaff, (0, zod_validation_middleware_1.validateBody)(validation_schemas_1.createInventoryLogSchema), this.inventoryController.createInventoryLogController);
        // 🔔 STOCK MONITORING ENDPOINTS
        // Manual trigger stock monitoring (Staff/Admin only)
        this.router.post("/monitor", auth_middleware_1.requireAuth, auth_middleware_1.requireStaff, this.stockMonitoringController.monitorAllProductsController);
        // Get stock summary (Staff/Admin only)
        this.router.get("/summary", auth_middleware_1.requireAuth, auth_middleware_1.requireStaff, this.stockMonitoringController.getStockSummaryController);
        // Get low stock products (Staff/Admin only)
        this.router.get("/low-stock", auth_middleware_1.requireAuth, auth_middleware_1.requireStaff, (0, zod_validation_middleware_1.validateQuery)(validation_schemas_1.lowStockQuerySchema), this.stockMonitoringController.getLowStockProductsController);
    }
    getRouter() {
        return this.router;
    }
}
exports.InventoryRouter = InventoryRouter;
