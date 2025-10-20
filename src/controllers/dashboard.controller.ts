import { Request, Response } from "express";
import {
  successResponse,
  errorResponse,
} from "../middlewares/async-handler.middleware";

// ✅ FALLBACK: Import with error handling for Vercel deployment
let dashboardCacheService: any;
try {
  dashboardCacheService =
    require("../services/cache/dashboard-cache.service").dashboardCacheService;
} catch (error) {
  console.warn("Dashboard cache service not available, using fallback");
  // Fallback implementation
  dashboardCacheService = {
    getDashboardStats: async (params: any) => {
      const { getDashboardStatsService } = await import(
        "../services/dashboard/get-dashboard-stats.service"
      );
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
      keys: [],
    }),
  };
}

export class DashboardController {
  async getDashboardStatsController(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      // ✅ OPTIMIZED: Use cached dashboard stats with fallback
      const stats = await dashboardCacheService.getDashboardStats({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });

      successResponse(res, stats, "Dashboard stats retrieved successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  // ✅ NEW: Cache management endpoints
  async invalidateCacheController(req: Request, res: Response) {
    try {
      dashboardCacheService.invalidateCache();
      successResponse(
        res,
        { success: true },
        "Dashboard cache invalidated successfully"
      );
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async getCacheStatsController(req: Request, res: Response) {
    try {
      const stats = dashboardCacheService.getCacheStats();
      successResponse(res, stats, "Cache statistics retrieved successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }
}
