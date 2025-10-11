import { Request, Response } from "express";
import { StockMonitoringService } from "../services/inventory/stock-monitoring.service";
import prisma from "../prisma";
import {
  successResponse,
  errorResponse,
} from "../middlewares/async-handler.middleware";

export class StockMonitoringController {
  // Manual trigger untuk monitor semua products
  async monitorAllProductsController(req: Request, res: Response) {
    try {
      const result = await StockMonitoringService.monitorAllProducts();
      successResponse(res, result, "Stock monitoring completed");
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  // Get stock summary untuk dashboard
  async getStockSummaryController(req: Request, res: Response) {
    try {
      const result = await StockMonitoringService.getStockSummary();
      successResponse(res, result, "Stock summary retrieved");
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  // Get products dengan low stock
  async getLowStockProductsController(req: Request, res: Response) {
    try {
      // Use validated query data if available, otherwise fallback to req.query
      const queryData = (req as any).validatedQuery || req.query;
      const { page = 1, limit = 10, status } = queryData;

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      // Build where clause berdasarkan status
      const where: any = {};

      if (status === "low") {
        where.stock = {
          lte: 10,
          gt: 5,
        };
      } else if (status === "critical") {
        where.stock = {
          lte: 5,
          gt: 0,
        };
      } else if (status === "out_of_stock") {
        where.stock = 0;
      } else {
        // Default: semua low stock (≤ 10)
        where.stock = {
          lte: 10,
        };
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            category: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            stock: "asc",
          },
          skip,
          take: parseInt(limit as string),
        }),
        prisma.product.count({ where }),
      ]);

      // Add stock status to each product
      const productsWithStatus = products.map((product) => ({
        ...product,
        stockStatus: StockMonitoringService.getStockStatus(product.stock),
      }));

      const totalPages = Math.ceil(total / parseInt(limit as string));

      successResponse(
        res,
        {
          products: productsWithStatus,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total,
            totalPages,
            hasNextPage: parseInt(page as string) < totalPages,
            hasPrevPage: parseInt(page as string) > 1,
          },
        },
        "Low stock products retrieved"
      );
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }
}
