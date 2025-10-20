import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";
import { uploadCloudinary } from "../services/category/upload-category-image-cloudinary-multer.service";
import { requireAuth, requireAdmin } from "../middlewares/auth.middleware";
import {
  validateBody,
  validateParams,
} from "../middlewares/validation.middleware";
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
} from "../utils/validation-schemas";

// Validation schemas are imported from validation-schemas.ts

export class CategoryRouter {
  private router: Router;
  private categoryController: CategoryController;

  constructor() {
    this.router = Router();
    this.categoryController = new CategoryController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Public routes
    this.router.get("/", this.categoryController.getCategoriesController);
    this.router.get(
      "/:categoryId",
      validateParams(categoryIdParamSchema),
      this.categoryController.getCategoryByIdController
    );

    // Admin routes
    this.router.post(
      "/",
      requireAuth,
      requireAdmin,
      validateBody(createCategorySchema),
      this.categoryController.createCategoryController
    );

    this.router.put(
      "/:categoryId",
      requireAuth,
      requireAdmin,
      validateParams(categoryIdParamSchema),
      validateBody(updateCategorySchema),
      this.categoryController.updateCategoryController
    );

    this.router.delete(
      "/:categoryId",
      requireAuth,
      requireAdmin,
      validateParams(categoryIdParamSchema),
      this.categoryController.deleteCategoryController
    );

    // Upload routes (Cloudinary)
    this.router.post(
      "/upload-image",
      requireAuth,
      requireAdmin,
      uploadCloudinary.single("image"),
      this.categoryController.uploadCategoryImageCloudinaryController
    );

    this.router.put(
      "/:categoryId/image",
      requireAuth,
      requireAdmin,
      validateParams(categoryIdParamSchema),
      uploadCloudinary.single("image"),
      this.categoryController.updateCategoryImageController
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
