"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryController = void 0;
const get_inventory_logs_service_1 = require("../services/inventory/get-inventory-logs.service");
const create_inventory_log_service_1 = require("../services/inventory/create-inventory-log.service");
const get_inventory_summary_service_1 = require("../services/inventory/get-inventory-summary.service");
const async_handler_middleware_1 = require("../middlewares/async-handler.middleware");
class InventoryController {
    async getInventorySummaryController(req, res) {
        try {
            const result = await (0, get_inventory_summary_service_1.getInventorySummaryService)();
            (0, async_handler_middleware_1.successResponse)(res, result, "Inventory summary retrieved successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
    async getInventoryLogsController(req, res) {
        try {
            // Use validated query data if available, otherwise fallback to req.query
            const queryData = req.validatedQuery || req.query;
            const result = await (0, get_inventory_logs_service_1.getInventoryLogsService)(queryData);
            (0, async_handler_middleware_1.successResponse)(res, result, "Inventory logs retrieved successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
    async createInventoryLogController(req, res) {
        try {
            const result = await (0, create_inventory_log_service_1.createInventoryLogService)(req.body);
            (0, async_handler_middleware_1.successResponse)(res, result, "Inventory log created successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
}
exports.InventoryController = InventoryController;
