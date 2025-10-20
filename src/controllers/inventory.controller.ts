import { Request, Response } from "express";
import { getInventoryLogsService } from "../services/inventory/get-inventory-logs.service";
import { createInventoryLogService } from "../services/inventory/create-inventory-log.service";
import { getInventorySummaryService } from "../services/inventory/get-inventory-summary.service";
import {
  successResponse,
  errorResponse,
} from "../middlewares/async-handler.middleware";

export class InventoryController {
  async getInventorySummaryController(req: Request, res: Response) {
    try {
      const result = await getInventorySummaryService();
      successResponse(res, result, "Inventory summary retrieved successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async getInventoryLogsController(req: Request, res: Response) {
    try {
      // Use validated query data if available, otherwise fallback to req.query
      const queryData = (req as any).validatedQuery || req.query;
      const result = await getInventoryLogsService(queryData);
      successResponse(res, result, "Inventory logs retrieved successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async createInventoryLogController(req: Request, res: Response) {
    try {
      const result = await createInventoryLogService(req.body);
      successResponse(res, result, "Inventory log created successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }
}
