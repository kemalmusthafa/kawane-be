import { Request, Response } from "express";
import { dashboardCacheService } from "../services/cache/dashboard-cache.service";
import {
  successResponse,
  errorResponse,
} from "../middlewares/async-handler.middleware";

export class DashboardController {
  async getDashboardStatsController(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      // ✅ OPTIMIZED: Use cached dashboard stats
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
