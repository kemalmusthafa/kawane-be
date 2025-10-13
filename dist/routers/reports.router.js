"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsRouter = void 0;
const express_1 = require("express");
const reports_controller_1 = require("../controllers/reports.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const zod_validation_middleware_1 = require("../middlewares/zod-validation.middleware");
const validation_schemas_1 = require("../utils/validation-schemas");
class ReportsRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.reportsController = new reports_controller_1.ReportsController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Get reports with pagination and filtering (Staff/Admin only)
        this.router.get("/", auth_middleware_1.requireAuth, auth_middleware_1.requireStaff, (0, zod_validation_middleware_1.validateQuery)(validation_schemas_1.reportsQuerySchema), this.reportsController.getReportsController);
        // Generate new report (Staff/Admin only)
        this.router.post("/", auth_middleware_1.requireAuth, auth_middleware_1.requireStaff, (0, zod_validation_middleware_1.validateBody)(validation_schemas_1.generateReportSchema), this.reportsController.generateReportController);
        // Download report (Staff/Admin only)
        this.router.get("/:reportId/download", auth_middleware_1.requireAuth, auth_middleware_1.requireStaff, (0, zod_validation_middleware_1.validateParams)(validation_schemas_1.reportIdParamSchema), this.reportsController.downloadReportController);
    }
    getRouter() {
        return this.router;
    }
}
exports.ReportsRouter = ReportsRouter;
