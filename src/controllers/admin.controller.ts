import { Request, Response } from "express";
import { createAdminService } from "../services/admin/create-admin.service";
import { createStaffService } from "../services/admin/create-staff.service";
import {
  successResponse,
  errorResponse,
} from "../middlewares/async-handler.middleware";

export class AdminController {
  async createAdminController(req: Request, res: Response) {
    try {
      const result = await createAdminService(req.body);
      successResponse(res, result, "Admin created successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async createStaffController(req: Request, res: Response) {
    try {
      const result = await createStaffService(req.body);
      successResponse(res, result, "Staff created successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }
}
