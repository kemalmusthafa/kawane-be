import { Router } from "express";
import { ReportsController } from "../controllers/reports.controller";
import { requireAuth, requireStaff } from "../middlewares/auth.middleware";
import {
  validateQuery,
  validateBody,
  validateParams,
} from "../middlewares/zod-validation.middleware";
import {
  reportsQuerySchema,
  generateReportSchema,
  reportIdParamSchema,
} from "../utils/validation-schemas";

export class ReportsRouter {
  private router: Router;
  private reportsController: ReportsController;

  constructor() {
    this.router = Router();
    this.reportsController = new ReportsController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get reports with pagination and filtering (Staff/Admin only)
    this.router.get(
      "/",
      requireAuth,
      requireStaff,
      validateQuery(reportsQuerySchema),
      this.reportsController.getReportsController
    );

    // Generate new report (Staff/Admin only)
    this.router.post(
      "/",
      requireAuth,
      requireStaff,
      validateBody(generateReportSchema),
      this.reportsController.generateReportController
    );

    // Download report (Staff/Admin only)
    this.router.get(
      "/:reportId/download",
      requireAuth,
      requireStaff,
      validateParams(reportIdParamSchema),
      this.reportsController.downloadReportController
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
