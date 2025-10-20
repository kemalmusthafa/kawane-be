import { Router } from "express";
import { DealController } from "../controllers/deal.controller";
import { requireAuth, requireStaff } from "../middlewares/auth.middleware";
import {
  validateBody,
  validateQuery,
  validateParams,
} from "../middlewares/validation.middleware";
import {
  createDealSchema,
  updateDealSchema,
  dealIdParamSchema,
  dealQuerySchema,
} from "../utils/validation-schemas";
import { uploadDealCloudinary } from "../services/deal/upload-deal-image-cloudinary-multer.service";

export class DealRouter {
  private router: Router;
  private dealController: DealController;

  constructor() {
    this.router = Router();
    this.dealController = new DealController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get flash sales (public) - must be before /:id
    this.router.get(
      "/flash-sales",
      this.dealController.getFlashSalesController
    );

    // Get featured deals (public) - must be before /:id
    this.router.get(
      "/featured",
      this.dealController.getFeaturedDealsController
    );

    // Get all deals (public)
    this.router.get(
      "/",
      validateQuery(dealQuerySchema),
      this.dealController.getDealsController
    );

    // Get deal by ID (public) - must be after specific routes
    this.router.get(
      "/:id",
      validateParams(dealIdParamSchema),
      this.dealController.getDealByIdController
    );

    // Create deal (Admin/Staff only)
    this.router.post(
      "/",
      requireAuth,
      requireStaff,
      validateBody(createDealSchema),
      this.dealController.createDealController
    );

    // Update deal (Admin/Staff only)
    this.router.put(
      "/:id",
      requireAuth,
      requireStaff,
      validateParams(dealIdParamSchema),
      validateBody(updateDealSchema),
      this.dealController.updateDealController
    );

    // Delete deal (Admin/Staff only)
    this.router.delete(
      "/:id",
      requireAuth,
      requireStaff,
      validateParams(dealIdParamSchema),
      this.dealController.deleteDealController
    );

    // Upload deal image (Admin/Staff only)
    this.router.post(
      "/upload-image",
      requireAuth,
      requireStaff,
      uploadDealCloudinary.single("image"),
      this.dealController.uploadDealImageController
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
