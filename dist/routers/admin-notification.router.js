"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminNotificationRouter = void 0;
const express_1 = require("express");
const admin_notification_controller_1 = require("../controllers/admin-notification.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const zod_validation_middleware_1 = require("../middlewares/zod-validation.middleware");
const zod_1 = require("zod");
const adminNotificationQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1, "Page must be at least 1").default(1),
    limit: zod_1.z.coerce
        .number()
        .int()
        .min(1, "Limit must be at least 1")
        .max(100, "Limit cannot exceed 100")
        .default(10),
    search: zod_1.z.string().optional(),
    isRead: zod_1.z.coerce.boolean().optional(),
});
const sendGeneralNotificationSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Title is required"),
    message: zod_1.z.string().min(1, "Message is required"),
    type: zod_1.z.enum(["INFO", "WARNING", "ERROR", "SUCCESS"]),
    priority: zod_1.z.enum(["LOW", "MEDIUM", "HIGH"]),
    target: zod_1.z.enum(["ALL", "ADMIN", "CUSTOMER"]),
});
const markAsReadSchema = zod_1.z.object({
    notificationId: zod_1.z.string().min(1, "Notification ID is required"),
});
const deleteNotificationSchema = zod_1.z.object({
    notificationId: zod_1.z.string().min(1, "Notification ID is required"),
});
class AdminNotificationRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.adminNotificationController = new admin_notification_controller_1.AdminNotificationController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Get all notifications for admin with search
        this.router.get("/", auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, (0, zod_validation_middleware_1.validateQuery)(adminNotificationQuerySchema), this.adminNotificationController.getAdminNotificationsController);
        // Get unread count
        this.router.get("/unread-count", auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, this.adminNotificationController.getUnreadCountController);
        // Send general notification
        this.router.post("/", auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, (0, zod_validation_middleware_1.validateBody)(sendGeneralNotificationSchema), this.adminNotificationController.sendGeneralNotificationController);
        // Mark notification as read
        this.router.post("/mark-read", auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, (0, zod_validation_middleware_1.validateBody)(markAsReadSchema), this.adminNotificationController.markNotificationAsReadController);
        // Delete notification
        this.router.delete("/:notificationId", auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, this.adminNotificationController.deleteNotificationController);
    }
    getRouter() {
        return this.router;
    }
}
exports.AdminNotificationRouter = AdminNotificationRouter;
