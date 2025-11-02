"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BannerRouter = void 0;
const express_1 = require("express");
const banner_controller_1 = require("../controllers/banner.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const zod_validation_middleware_1 = require("../middlewares/zod-validation.middleware");
const validation_schemas_1 = require("../utils/validation-schemas");
class BannerRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.bannerController = new banner_controller_1.BannerController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Public route - Get all active banners (or all if admin)
        this.router.get("/", this.bannerController.getBannersController);
        // Admin routes
        this.router.post("/", auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, (0, zod_validation_middleware_1.validateBody)(validation_schemas_1.createBannerSchema), this.bannerController.createBannerController);
        this.router.put("/:bannerId", auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, (0, zod_validation_middleware_1.validateParams)(validation_schemas_1.bannerIdParamSchema), (0, zod_validation_middleware_1.validateBody)(validation_schemas_1.updateBannerSchema), this.bannerController.updateBannerController);
        this.router.delete("/:bannerId", auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, (0, zod_validation_middleware_1.validateParams)(validation_schemas_1.bannerIdParamSchema), this.bannerController.deleteBannerController);
    }
    getRouter() {
        return this.router;
    }
}
exports.BannerRouter = BannerRouter;
