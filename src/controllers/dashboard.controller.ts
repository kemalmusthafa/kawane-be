import { Request, Response } from "express";
import { getDashboardStatsService } from "../services/dashboard/get-dashboard-stats.service";
import {
  successResponse,
  errorResponse,
} from "../middlewares/async-handler.middleware";

export class DashboardController {
  async getDashboardStatsController(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      const stats = await getDashboardStatsService({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });

      successResponse(res, stats, "Dashboard stats retrieved successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }
}
