"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRouter = void 0;
const express_1 = require("express");
const category_controller_1 = require("../controllers/category.controller");
const upload_category_image_cloudinary_multer_service_1 = require("../services/category/upload-category-image-cloudinary-multer.service");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const validation_schemas_1 = require("../utils/validation-schemas");
// Validation schemas are imported from validation-schemas.ts
class CategoryRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.categoryController = new category_controller_1.CategoryController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Public routes
        this.router.get("/", this.categoryController.getCategoriesController);
        this.router.get("/:categoryId", (0, validation_middleware_1.validateParams)(validation_schemas_1.categoryIdParamSchema), this.categoryController.getCategoryByIdController);
        // Admin routes
        this.router.post("/", auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, (0, validation_middleware_1.validateBody)(validation_schemas_1.createCategorySchema), this.categoryController.createCategoryController);
        this.router.put("/:categoryId", auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, (0, validation_middleware_1.validateParams)(validation_schemas_1.categoryIdParamSchema), (0, validation_middleware_1.validateBody)(validation_schemas_1.updateCategorySchema), this.categoryController.updateCategoryController);
        this.router.delete("/:categoryId", auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, (0, validation_middleware_1.validateParams)(validation_schemas_1.categoryIdParamSchema), this.categoryController.deleteCategoryController);
        // Upload routes (Cloudinary)
        this.router.post("/upload-image", auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, upload_category_image_cloudinary_multer_service_1.uploadCloudinary.single("image"), this.categoryController.uploadCategoryImageCloudinaryController);
        this.router.put("/:categoryId/image", auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, (0, validation_middleware_1.validateParams)(validation_schemas_1.categoryIdParamSchema), upload_category_image_cloudinary_multer_service_1.uploadCloudinary.single("image"), this.categoryController.updateCategoryImageController);
    }
    getRouter() {
        return this.router;
    }
}
exports.CategoryRouter = CategoryRouter;
