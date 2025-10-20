"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRouter = void 0;
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const zod_validation_middleware_1 = require("../middlewares/zod-validation.middleware");
const validation_schemas_1 = require("../utils/validation-schemas");
class NotificationRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.notificationController = new notification_controller_1.NotificationController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Get user notifications with pagination
        this.router.get("/", auth_middleware_1.requireAuth, (0, zod_validation_middleware_1.validateQuery)(validation_schemas_1.notificationQuerySchema), this.notificationController.getNotificationsController);
        // Get unread notification count
        this.router.get("/unread-count", auth_middleware_1.requireAuth, this.notificationController.getUnreadCountController);
        // Mark notifications as read
        this.router.post("/mark-read", auth_middleware_1.requireAuth, (0, zod_validation_middleware_1.validateBody)(validation_schemas_1.markAsReadSchema), this.notificationController.markAsReadController);
    }
    getRouter() {
        return this.router;
    }
}
exports.NotificationRouter = NotificationRouter;
