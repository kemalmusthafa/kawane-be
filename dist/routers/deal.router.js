"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DealRouter = void 0;
const express_1 = require("express");
const deal_controller_1 = require("../controllers/deal.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const validation_schemas_1 = require("../utils/validation-schemas");
const upload_deal_image_cloudinary_multer_service_1 = require("../services/deal/upload-deal-image-cloudinary-multer.service");
class DealRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.dealController = new deal_controller_1.DealController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Get flash sales (public) - must be before /:id
        this.router.get("/flash-sales", this.dealController.getFlashSalesController);
        // Get featured deals (public) - must be before /:id
        this.router.get("/featured", this.dealController.getFeaturedDealsController);
        // Get all deals (public)
        this.router.get("/", (0, validation_middleware_1.validateQuery)(validation_schemas_1.dealQuerySchema), this.dealController.getDealsController);
        // Get deal by ID (public) - must be after specific routes
        this.router.get("/:id", (0, validation_middleware_1.validateParams)(validation_schemas_1.dealIdParamSchema), this.dealController.getDealByIdController);
        // Create deal (Admin/Staff only)
        this.router.post("/", auth_middleware_1.requireAuth, auth_middleware_1.requireStaff, (0, validation_middleware_1.validateBody)(validation_schemas_1.createDealSchema), this.dealController.createDealController);
        // Update deal (Admin/Staff only)
        this.router.put("/:id", auth_middleware_1.requireAuth, auth_middleware_1.requireStaff, (0, validation_middleware_1.validateParams)(validation_schemas_1.dealIdParamSchema), (0, validation_middleware_1.validateBody)(validation_schemas_1.updateDealSchema), this.dealController.updateDealController);
        // Delete deal (Admin/Staff only)
        this.router.delete("/:id", auth_middleware_1.requireAuth, auth_middleware_1.requireStaff, (0, validation_middleware_1.validateParams)(validation_schemas_1.dealIdParamSchema), this.dealController.deleteDealController);
        // Upload deal image (Admin/Staff only)
        this.router.post("/upload-image", auth_middleware_1.requireAuth, auth_middleware_1.requireStaff, upload_deal_image_cloudinary_multer_service_1.uploadDealCloudinary.single("image"), this.dealController.uploadDealImageController);
    }
    getRouter() {
        return this.router;
    }
}
exports.DealRouter = DealRouter;
