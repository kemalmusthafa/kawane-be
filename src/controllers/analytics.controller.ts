import { Request, Response } from "express";
import { AnalyticsService } from "../services/analytics/analytics.service";
import { asyncHandler } from "../middlewares/async-handler.middleware";

export class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  public getAnalyticsController = asyncHandler(
    async (req: Request, res: Response) => {
      const { period = "30" } = req.query;

      const analytics = await this.analyticsService.getAnalytics(
        parseInt(period as string)
      );

      res.status(200).json({
        success: true,
        message: "Analytics data retrieved successfully",
        data: analytics,
      });
    }
  );
}
