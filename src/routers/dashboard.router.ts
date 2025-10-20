import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller";
import { requireAuth, requireStaff } from "../middlewares/auth.middleware";
import { validateQuery } from "../middlewares/zod-validation.middleware";
import { dashboardQuerySchema } from "../utils/validation-schemas";

export class DashboardRouter {
  private router: Router;
  private dashboardController: DashboardController;

  constructor() {
    this.router = Router();
    this.dashboardController = new DashboardController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get dashboard statistics (Staff/Admin only)
    this.router.get(
      "/stats",
      requireAuth,
      requireStaff,
      validateQuery(dashboardQuerySchema),
      this.dashboardController.getDashboardStatsController
    );

    // ✅ NEW: Cache management endpoints (Admin only)
    this.router.post(
      "/cache/invalidate",
      requireAuth,
      requireStaff,
      this.dashboardController.invalidateCacheController
    );

    this.router.get(
      "/cache/stats",
      requireAuth,
      requireStaff,
      this.dashboardController.getCacheStatsController
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
