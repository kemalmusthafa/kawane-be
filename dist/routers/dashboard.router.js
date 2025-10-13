"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardRouter = void 0;
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const zod_validation_middleware_1 = require("../middlewares/zod-validation.middleware");
const validation_schemas_1 = require("../utils/validation-schemas");
class DashboardRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.dashboardController = new dashboard_controller_1.DashboardController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Get dashboard statistics (Staff/Admin only)
        this.router.get("/stats", auth_middleware_1.requireAuth, auth_middleware_1.requireStaff, (0, zod_validation_middleware_1.validateQuery)(validation_schemas_1.dashboardQuerySchema), this.dashboardController.getDashboardStatsController);
    }
    getRouter() {
        return this.router;
    }
}
exports.DashboardRouter = DashboardRouter;
