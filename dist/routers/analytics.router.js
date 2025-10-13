"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsRouter = void 0;
const express_1 = require("express");
const analytics_controller_1 = require("../controllers/analytics.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const zod_validation_middleware_1 = require("../middlewares/zod-validation.middleware");
const validation_schemas_1 = require("../utils/validation-schemas");
class AnalyticsRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.analyticsController = new analytics_controller_1.AnalyticsController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Get analytics data (Staff/Admin only)
        this.router.get("/", auth_middleware_1.requireAuth, auth_middleware_1.requireStaff, (0, zod_validation_middleware_1.validateQuery)(validation_schemas_1.analyticsQuerySchema), this.analyticsController.getAnalyticsController);
    }
    getRouter() {
        return this.router;
    }
}
exports.AnalyticsRouter = AnalyticsRouter;
