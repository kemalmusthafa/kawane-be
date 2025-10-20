import { Router } from "express";
import { StockMonitoringController } from "../controllers/stock-monitoring.controller";
import { requireAuth, requireAdmin } from "../middlewares/auth.middleware";
import { validateParams } from "../middlewares/zod-validation.middleware";
import { productIdParamSchema } from "../utils/validation-schemas";

export class StockMonitoringRouter {
  private router: Router;
  private stockMonitoringController: StockMonitoringController;

  constructor() {
    this.router = Router();
    this.stockMonitoringController = new StockMonitoringController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Run stock monitoring for all products (Admin only)
    this.router.post(
      "/run-monitoring",
      requireAuth,
      requireAdmin,
      this.stockMonitoringController.runStockMonitoringController
    );

    // Run stock monitoring for specific product (Admin only)
    this.router.post(
      "/run-monitoring/:productId",
      requireAuth,
      requireAdmin,
      validateParams(productIdParamSchema),
      this.stockMonitoringController.runSingleProductMonitoringController
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}



