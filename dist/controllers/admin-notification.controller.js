"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminNotificationController = void 0;
const get_admin_notifications_service_1 = require("../services/notification/get-admin-notifications.service");
const send_general_notification_service_1 = require("../services/notification/send-general-notification.service");
const prisma_1 = __importDefault(require("../prisma"));
const async_handler_middleware_1 = require("../middlewares/async-handler.middleware");
class AdminNotificationController {
    async getAdminNotificationsController(req, res) {
        try {
            const queryData = req.validatedQuery || req.query;
            const { search, page, limit, isRead } = queryData;
            const result = await (0, get_admin_notifications_service_1.getAdminNotificationsService)({
                search: search,
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 10,
                isRead: isRead ? isRead === "true" : undefined,
            });
            (0, async_handler_middleware_1.successResponse)(res, result, "Admin notifications retrieved successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
    async sendGeneralNotificationController(req, res) {
        try {
            const { title, message, type, priority, target } = req.body;
            if (!title || !message || !type || !priority || !target) {
                return (0, async_handler_middleware_1.errorResponse)(res, "All fields are required", 400);
            }
            const result = await (0, send_general_notification_service_1.sendGeneralNotificationService)({
                title,
                message,
                type,
                priority,
                target,
            });
            (0, async_handler_middleware_1.successResponse)(res, result, "General notification sent successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
    async getUnreadCountController(req, res) {
        try {
            const unreadCount = await prisma_1.default.notification.count({
                where: {
                    isRead: false,
                    isDeleted: false,
                },
            });
            (0, async_handler_middleware_1.successResponse)(res, { unreadCount }, "Unread count retrieved successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
    async markNotificationAsReadController(req, res) {
        try {
            const { notificationId, markAll } = req.body;
            if (markAll) {
                // Mark all notifications as read
                await prisma_1.default.notification.updateMany({
                    where: {
                        isRead: false,
                        isDeleted: false,
                    },
                    data: { isRead: true },
                });
                (0, async_handler_middleware_1.successResponse)(res, { success: true }, "All notifications marked as read");
                return;
            }
            if (!notificationId) {
                return (0, async_handler_middleware_1.errorResponse)(res, "Notification ID is required", 400);
            }
            // Check if notification exists
            const notification = await prisma_1.default.notification.findUnique({
                where: { id: notificationId },
            });
            if (!notification) {
                return (0, async_handler_middleware_1.errorResponse)(res, "Notification not found", 404);
            }
            // Mark as read
            await prisma_1.default.notification.update({
                where: { id: notificationId },
                data: { isRead: true },
            });
            (0, async_handler_middleware_1.successResponse)(res, { success: true }, "Notification marked as read");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
    async deleteNotificationController(req, res) {
        try {
            const { notificationId } = req.params;
            if (!notificationId) {
                return (0, async_handler_middleware_1.errorResponse)(res, "Notification ID is required", 400);
            }
            // Check if notification exists
            const notification = await prisma_1.default.notification.findUnique({
                where: { id: notificationId },
            });
            if (!notification) {
                return (0, async_handler_middleware_1.errorResponse)(res, "Notification not found", 404);
            }
            // Soft delete notification
            await prisma_1.default.notification.update({
                where: { id: notificationId },
                data: { isDeleted: true },
            });
            (0, async_handler_middleware_1.successResponse)(res, { success: true }, "Notification deleted successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
}
exports.AdminNotificationController = AdminNotificationController;
