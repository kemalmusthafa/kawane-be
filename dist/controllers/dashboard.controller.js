"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const get_dashboard_stats_service_1 = require("../services/dashboard/get-dashboard-stats.service");
const async_handler_middleware_1 = require("../middlewares/async-handler.middleware");
class DashboardController {
    async getDashboardStatsController(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const stats = await (0, get_dashboard_stats_service_1.getDashboardStatsService)({
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
            });
            (0, async_handler_middleware_1.successResponse)(res, stats, "Dashboard stats retrieved successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
}
exports.DashboardController = DashboardController;
