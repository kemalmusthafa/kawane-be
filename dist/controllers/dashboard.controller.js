"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const async_handler_middleware_1 = require("../middlewares/async-handler.middleware");
// ✅ FALLBACK: Import with error handling for Vercel deployment
let dashboardCacheService;
try {
    dashboardCacheService = require("../services/cache/dashboard-cache.service").dashboardCacheService;
}
catch (error) {
    console.warn("Dashboard cache service not available, using fallback");
    // Fallback implementation
    dashboardCacheService = {
        getDashboardStats: async (params) => {
            const { getDashboardStatsService } = await Promise.resolve().then(() => __importStar(require("../services/dashboard/get-dashboard-stats.service")));
            return await getDashboardStatsService(params);
        },
        invalidateCache: () => {
            console.log("Cache invalidation not available");
        },
        getCacheStats: () => ({
            enabled: false,
            ttl: 0,
            maxSize: 0,
            currentSize: 0,
            keys: []
        })
    };
}
class DashboardController {
    async getDashboardStatsController(req, res) {
        try {
            const { startDate, endDate } = req.query;
            // ✅ OPTIMIZED: Use cached dashboard stats with fallback
            const stats = await dashboardCacheService.getDashboardStats({
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
            dashboardCacheService.invalidateCache();
            (0, async_handler_middleware_1.successResponse)(res, { success: true }, "Dashboard cache invalidated successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
    async getCacheStatsController(req, res) {
        try {
            const stats = dashboardCacheService.getCacheStats();
            (0, async_handler_middleware_1.successResponse)(res, stats, "Cache statistics retrieved successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
}
exports.DashboardController = DashboardController;
