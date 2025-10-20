import { Request, Response } from "express";
import { createDealService } from "../services/deal/create-deal.service";
import { getDealsService } from "../services/deal/get-deals.service";
import { getDealByIdService } from "../services/deal/get-deal-by-id.service";
import { updateDealService } from "../services/deal/update-deal.service";
import { deleteDealService } from "../services/deal/delete-deal.service";
import { uploadDealImageCloudinaryService } from "../services/deal/upload-deal-image-cloudinary.service";
import {
  successResponse,
  errorResponse,
} from "../middlewares/async-handler.middleware";

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
  validatedBody?: any;
  validatedParams?: any;
  validatedQuery?: any;
}

export class DealController {
  // Create new deal (Admin/Staff only)
  async createDealController(req: AuthRequest, res: Response) {
    try {
      const dealData = req.validatedBody || req.body;
      const result = await createDealService(dealData);
      successResponse(res, result.data, result.message);
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  // Get all deals
  async getDealsController(req: AuthRequest, res: Response) {
    try {
      const queryData = req.validatedQuery || req.query;
      const result = await getDealsService(queryData);
      successResponse(res, result, "Deals retrieved successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  // Get deal by ID
  async getDealByIdController(req: AuthRequest, res: Response) {
    try {
      const paramsData = req.validatedParams || req.params;
      const { id } = paramsData;

      const result = await getDealByIdService({ id });
      successResponse(res, result.data, result.message);
    } catch (error: any) {
      errorResponse(res, error.message, 404);
    }
  }

  // Update deal (Admin/Staff only)
  async updateDealController(req: AuthRequest, res: Response) {
    try {
      const paramsData = req.validatedParams || req.params;
      const bodyData = req.validatedBody || req.body;
      const { id } = paramsData;

      const result = await updateDealService({
        id,
        ...bodyData,
      });

      successResponse(res, result.data, result.message);
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  // Delete deal (Admin/Staff only)
  async deleteDealController(req: AuthRequest, res: Response) {
    try {
      const paramsData = req.validatedParams || req.params;
      const { id } = paramsData;

      const result = await deleteDealService({ id });
      successResponse(res, null, result.message);
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  // Get active flash sales
  async getFlashSalesController(req: AuthRequest, res: Response) {
    try {
      const result = await getDealsService({
        isFlashSale: true,
        status: "ACTIVE",
        includeExpired: false,
      });
      successResponse(res, result, "Flash sales retrieved successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  // Get featured deals
  async getFeaturedDealsController(req: AuthRequest, res: Response) {
    try {
      const result = await getDealsService({
        status: "ACTIVE",
        isFlashSale: false,
        includeExpired: false,
        limit: 6,
      });
      successResponse(res, result, "Featured deals retrieved successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  // Upload deal image (Admin/Staff only)
  async uploadDealImageController(req: AuthRequest, res: Response) {
    try {
      const file = req.file;
      if (!file) {
        return errorResponse(res, "No image file provided", 400);
      }

      const result = await uploadDealImageCloudinaryService(file);
      successResponse(res, result.data, result.message);
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }
}
