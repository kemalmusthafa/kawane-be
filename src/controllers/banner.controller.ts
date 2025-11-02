import { Request, Response } from "express";
import { createBannerService } from "../services/banner/create-banner.service";
import { updateBannerService } from "../services/banner/update-banner.service";
import { deleteBannerService } from "../services/banner/delete-banner.service";
import { getBannersService } from "../services/banner/get-banners.service";
import {
  successResponse,
  errorResponse,
} from "../middlewares/async-handler.middleware";

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export class BannerController {
  // Get all banners (Public for active, Admin for all)
  async getBannersController(req: Request, res: Response) {
    try {
      const { isActive, includeInactive } = req.query;
      
      // If user is admin/staff, allow seeing all banners
      const authReq = req as AuthRequest;
      const includeAll = authReq.user && 
        (authReq.user.role === "ADMIN" || authReq.user.role === "STAFF");

      const result = await getBannersService({
        isActive: isActive !== undefined ? isActive === "true" : undefined,
        includeInactive: includeAll ? includeInactive === "true" : false,
      });

      successResponse(res, result, "Banners retrieved successfully");
    } catch (error: any) {
      console.error("Get banners error:", error);
      errorResponse(res, error.message, 500);
    }
  }

  // Create banner (Admin only)
  async createBannerController(req: AuthRequest, res: Response) {
    try {
      // Check if user is admin
      if (!req.user || req.user.role !== "ADMIN") {
        return errorResponse(res, "Unauthorized. Admin access required", 403);
      }

      const {
        text,
        isActive,
        backgroundColor,
        textColor,
        linkUrl,
        linkText,
        dealId,
        priority,
        duration,
      } = req.body;

      const newBanner = await createBannerService({
        text,
        isActive,
        backgroundColor,
        textColor,
        linkUrl,
        linkText,
        dealId,
        priority,
        duration,
      });

      successResponse(res, newBanner, "Banner created successfully");
    } catch (error: any) {
      console.error("Create banner error:", error);
      errorResponse(res, error.message, 400);
    }
  }

  // Update banner (Admin only)
  async updateBannerController(req: AuthRequest, res: Response) {
    try {
      const { bannerId } = req.params;

      // Check if user is admin
      if (!req.user || req.user.role !== "ADMIN") {
        return errorResponse(res, "Unauthorized. Admin access required", 403);
      }

      const {
        text,
        isActive,
        backgroundColor,
        textColor,
        linkUrl,
        linkText,
        dealId,
        priority,
        duration,
      } = req.body;

      const updatedBanner = await updateBannerService(bannerId, {
        text,
        isActive,
        backgroundColor,
        textColor,
        linkUrl,
        linkText,
        dealId,
        priority,
        duration,
      });

      successResponse(res, updatedBanner, "Banner updated successfully");
    } catch (error: any) {
      console.error("Update banner error:", error);
      errorResponse(res, error.message, 400);
    }
  }

  // Delete banner (Admin only)
  async deleteBannerController(req: AuthRequest, res: Response) {
    try {
      const { bannerId } = req.params;

      // Check if user is admin
      if (!req.user || req.user.role !== "ADMIN") {
        return errorResponse(res, "Unauthorized. Admin access required", 403);
      }

      const result = await deleteBannerService(bannerId);

      successResponse(res, result, "Banner deleted successfully");
    } catch (error: any) {
      console.error("Delete banner error:", error);
      errorResponse(res, error.message, 400);
    }
  }
}

