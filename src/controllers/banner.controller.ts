// Banner feature removed - controller disabled
import { Request, Response } from "express";
import {
  successResponse,
  errorResponse,
} from "../middlewares/async-handler.middleware";

export class BannerController {
  async createBanner(req: Request, res: Response) {
    return errorResponse(res, "Banner feature has been removed", 404);
  }

  async getBanners(req: Request, res: Response) {
    return successResponse(res, [], "Banners feature removed");
  }

  async updateBanner(req: Request, res: Response) {
    return errorResponse(res, "Banner feature has been removed", 404);
  }

  async deleteBanner(req: Request, res: Response) {
    return errorResponse(res, "Banner feature has been removed", 404);
  }
}
