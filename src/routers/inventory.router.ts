import { Router } from "express";
import { InventoryController } from "../controllers/inventory.controller";
import { StockMonitoringController } from "../controllers/stock-monitoring.controller";
import { requireAuth, requireStaff } from "../middlewares/auth.middleware";
import {
  validateBody,
  validateQuery,
} from "../middlewares/zod-validation.middleware";
import {
  inventoryLogQuerySchema,
  createInventoryLogSchema,
  lowStockQuerySchema,
} from "../utils/validation-schemas";

export class InventoryRouter {
  private router: Router;
  private inventoryController: InventoryController;
  private stockMonitoringController: StockMonitoringController;

  constructor() {
    this.router = Router();
    this.inventoryController = new InventoryController();
    this.stockMonitoringController = new StockMonitoringController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get inventory summary (Staff/Admin only)
    this.router.get(
      "/summary",
      requireAuth,
      requireStaff,
      this.inventoryController.getInventorySummaryController
    );

    // Get inventory logs with pagination and filtering (Staff/Admin only)
    this.router.get(
      "/logs",
      requireAuth,
      requireStaff,
      validateQuery(inventoryLogQuerySchema),
      this.inventoryController.getInventoryLogsController
    );

    // Create inventory log (Staff/Admin only)
    this.router.post(
      "/logs",
      requireAuth,
      requireStaff,
      validateBody(createInventoryLogSchema),
      this.inventoryController.createInventoryLogController
    );

    // 🔔 STOCK MONITORING ENDPOINTS

    // Manual trigger stock monitoring (Staff/Admin only)
    this.router.post(
      "/monitor",
      requireAuth,
      requireStaff,
      this.stockMonitoringController.runStockMonitoringController
    );

    // Get stock summary (Staff/Admin only)
    this.router.get(
      "/summary",
      requireAuth,
      requireStaff,
      this.stockMonitoringController.getStockSummaryController
    );

    // Get low stock products (Staff/Admin only)
    this.router.get(
      "/low-stock",
      requireAuth,
      requireStaff,
      validateQuery(lowStockQuerySchema),
      this.stockMonitoringController.getLowStockProductsController
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
