import { Request, Response } from "express";
import { StockCronService } from "../services/inventory/stock-cron.service";
import { StockMonitoringService } from "../services/inventory/stock-monitoring.service";
import {
  successResponse,
  errorResponse,
} from "../middlewares/async-handler.middleware";

export class StockMonitoringController {
  /**
   * Jalankan stock monitoring untuk semua produk
   */
  async runStockMonitoringController(req: Request, res: Response) {
    try {
      await StockCronService.manualTrigger();

      successResponse(
        res,
        { success: true },
        "Stock monitoring completed successfully"
      );
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  /**
   * Jalankan stock monitoring untuk produk tertentu
   */
  async runSingleProductMonitoringController(req: Request, res: Response) {
    try {
      const { productId } = req.params;

      if (!productId) {
        return errorResponse(res, "Product ID is required", 400);
      }

      const result = await StockMonitoringService.monitorSingleProduct(
        productId
      );

      successResponse(
        res,
        result,
        "Single product monitoring completed successfully"
      );
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  /**
   * Get stock summary untuk dashboard
   */
  async getStockSummaryController(req: Request, res: Response) {
    try {
      const result = await StockMonitoringService.getStockSummary();

      successResponse(res, result, "Stock summary retrieved successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  /**
   * Get low stock products
   */
  async getLowStockProductsController(req: Request, res: Response) {
    try {
      const queryData = (req as any).validatedQuery || req.query;
      const { page = 1, limit = 10 } = queryData;

      // Get products with low stock
      const products = await StockMonitoringService.getLowStockProducts({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      });

      successResponse(
        res,
        products,
        "Low stock products retrieved successfully"
      );
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }
}
