import { Router } from "express";
import { BannerController } from "../controllers/banner.controller";
import { requireAuth, requireAdmin } from "../middlewares/auth.middleware";
import {
  validateBody,
  validateParams,
} from "../middlewares/zod-validation.middleware";
import {
  createBannerSchema,
  updateBannerSchema,
  bannerIdParamSchema,
} from "../utils/validation-schemas";

export class BannerRouter {
  private router: Router;
  private bannerController: BannerController;

  constructor() {
    this.router = Router();
    this.bannerController = new BannerController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Public route - Get all active banners (or all if admin)
    this.router.get("/", this.bannerController.getBannersController);

    // Admin routes
    this.router.post(
      "/",
      requireAuth,
      requireAdmin,
      validateBody(createBannerSchema),
      this.bannerController.createBannerController
    );

    this.router.put(
      "/:bannerId",
      requireAuth,
      requireAdmin,
      validateParams(bannerIdParamSchema),
      validateBody(updateBannerSchema),
      this.bannerController.updateBannerController
    );

    this.router.delete(
      "/:bannerId",
      requireAuth,
      requireAdmin,
      validateParams(bannerIdParamSchema),
      this.bannerController.deleteBannerController
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}

