import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { requireAuth, requireAdmin } from "../middlewares/auth.middleware";
import {
  validateBody,
  validateQuery,
  validateParams,
} from "../middlewares/zod-validation.middleware";
import {
  cacheProducts,
  cacheProduct,
  invalidateCache,
} from "../middlewares/cache.middleware";
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  productIdParamSchema,
} from "../utils/validation-schemas";

export class ProductRouter {
  private router: Router;
  private productController: ProductController;

  constructor() {
    this.router = Router();
    this.productController = new ProductController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get all products with pagination (cache disabled)
    this.router.get(
      "/",
      // cacheProducts, // DISABLED to reduce Supabase quota usage
      validateQuery(productQuerySchema),
      this.productController.getProductsController
    );

    // Get product detail by ID (cache disabled)
    this.router.get(
      "/:productId",
      // cacheProduct, // DISABLED to reduce Supabase quota usage
      validateParams(productIdParamSchema),
      this.productController.getProductDetailController
    );

    // Create new product (Admin only) - cache invalidation disabled
    this.router.post(
      "/",
      requireAuth,
      requireAdmin,
      validateBody(createProductSchema),
      // invalidateCache(["products:*"]), // DISABLED to reduce Supabase quota usage
      this.productController.createProductController
    );

    // Update product (Admin only) - cache invalidation disabled
    this.router.put(
      "/:productId",
      requireAuth,
      requireAdmin,
      validateParams(productIdParamSchema),
      validateBody(updateProductSchema),
      // invalidateCache(["products:*"]), // DISABLED to reduce Supabase quota usage
      this.productController.updateProductController
    );

    // Delete product (Admin only) - cache invalidation disabled
    this.router.delete(
      "/:productId",
      requireAuth,
      requireAdmin,
      validateParams(productIdParamSchema),
      // invalidateCache(["products:*"]), // DISABLED to reduce Supabase quota usage
      this.productController.deleteProductController
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
