"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const dashboard_cache_service_1 = require("../services/cache/dashboard-cache.service");
const async_handler_middleware_1 = require("../middlewares/async-handler.middleware");
class DashboardController {
    async getDashboardStatsController(req, res) {
        try {
            const { startDate, endDate } = req.query;
            // ✅ OPTIMIZED: Use cached dashboard stats
            const stats = await dashboard_cache_service_1.dashboardCacheService.getDashboardStats({
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
            });
            (0, async_handler_middleware_1.successResponse)(res, stats, "Dashboard stats retrieved successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    // ✅ NEW: Cache management endpoints
    async invalidateCacheController(req, res) {
        try {
            dashboard_cache_service_1.dashboardCacheService.invalidateCache();
            (0, async_handler_middleware_1.successResponse)(res, { success: true }, "Dashboard cache invalidated successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
    async getCacheStatsController(req, res) {
        try {
            const stats = dashboard_cache_service_1.dashboardCacheService.getCacheStats();
            (0, async_handler_middleware_1.successResponse)(res, stats, "Cache statistics retrieved successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
}
exports.DashboardController = DashboardController;
