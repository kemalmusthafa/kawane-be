"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsRouter = void 0;
const express_1 = require("express");
const settings_controller_1 = require("../controllers/settings.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const zod_validation_middleware_1 = require("../middlewares/zod-validation.middleware");
const validation_schemas_1 = require("../utils/validation-schemas");
class SettingsRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.settingsController = new settings_controller_1.SettingsController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Get system settings (Admin only)
        this.router.get("/", auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, this.settingsController.getSettingsController);
        // Update system settings (Admin only)
        this.router.put("/", auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, (0, zod_validation_middleware_1.validateBody)(validation_schemas_1.updateSettingsSchema), this.settingsController.updateSettingsController);
    }
    getRouter() {
        return this.router;
    }
}
exports.SettingsRouter = SettingsRouter;
