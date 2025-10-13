"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRouter = void 0;
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const zod_validation_middleware_1 = require("../middlewares/zod-validation.middleware");
const validation_schemas_1 = require("../utils/validation-schemas");
class ProductRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.productController = new product_controller_1.ProductController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Get all products with pagination (cache disabled)
        this.router.get("/", 
        // cacheProducts, // DISABLED to reduce Supabase quota usage
        (0, zod_validation_middleware_1.validateQuery)(validation_schemas_1.productQuerySchema), this.productController.getProductsController);
        // Get product detail by ID (cache disabled)
        this.router.get("/:productId", 
        // cacheProduct, // DISABLED to reduce Supabase quota usage
        (0, zod_validation_middleware_1.validateParams)(validation_schemas_1.productIdParamSchema), this.productController.getProductDetailController);
        // Create new product (Admin only) - cache invalidation disabled
        this.router.post("/", auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, (0, zod_validation_middleware_1.validateBody)(validation_schemas_1.createProductSchema), 
        // invalidateCache(["products:*"]), // DISABLED to reduce Supabase quota usage
        this.productController.createProductController);
        // Update product (Admin only) - cache invalidation disabled
        this.router.put("/:productId", auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, (0, zod_validation_middleware_1.validateParams)(validation_schemas_1.productIdParamSchema), (0, zod_validation_middleware_1.validateBody)(validation_schemas_1.updateProductSchema), 
        // invalidateCache(["products:*"]), // DISABLED to reduce Supabase quota usage
        this.productController.updateProductController);
        // Delete product (Admin only) - cache invalidation disabled
        this.router.delete("/:productId", auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, (0, zod_validation_middleware_1.validateParams)(validation_schemas_1.productIdParamSchema), 
        // invalidateCache(["products:*"]), // DISABLED to reduce Supabase quota usage
        this.productController.deleteProductController);
    }
    getRouter() {
        return this.router;
    }
}
exports.ProductRouter = ProductRouter;
