import { Request, Response } from "express";
import {
  getBestSellersService,
  GetBestSellersParams,
} from "../services/product/get-best-sellers.service";
import {
  successResponse,
  errorResponse,
} from "../middlewares/async-handler.middleware";

export class BestSellersController {
  async getBestSellersController(req: Request, res: Response) {
    try {
      const { limit, categoryId, timeRange } = req.query;

      const params: GetBestSellersParams = {
        limit: limit ? parseInt(limit as string) : 4,
        categoryId: categoryId as string,
        timeRange:
          (timeRange as "week" | "month" | "quarter" | "year" | "all") ||
          "month",
      };

      const result = await getBestSellersService(params);
      successResponse(res, result.data, result.message);
    } catch (error: any) {
      console.error("Best sellers error:", error);
      errorResponse(res, error.message || "Internal server error", 500);
    }
  }
}
