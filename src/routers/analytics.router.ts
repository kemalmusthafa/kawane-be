import { Router } from "express";
import { AnalyticsController } from "../controllers/analytics.controller";
import { requireAuth, requireStaff } from "../middlewares/auth.middleware";
import { validateQuery } from "../middlewares/zod-validation.middleware";
import { analyticsQuerySchema } from "../utils/validation-schemas";

export class AnalyticsRouter {
  private router: Router;
  private analyticsController: AnalyticsController;

  constructor() {
    this.router = Router();
    this.analyticsController = new AnalyticsController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get analytics data (Staff/Admin only)
    this.router.get(
      "/",
      requireAuth,
      requireStaff,
      validateQuery(analyticsQuerySchema),
      this.analyticsController.getAnalyticsController
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
