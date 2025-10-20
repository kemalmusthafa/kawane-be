"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const get_notifications_service_1 = require("../services/notification/get-notifications.service");
const mark_as_read_service_1 = require("../services/notification/mark-as-read.service");
const whatsapp_order_notification_service_1 = require("../services/notification/whatsapp-order-notification.service");
const async_handler_middleware_1 = require("../middlewares/async-handler.middleware");
class NotificationController {
    async getNotificationsController(req, res) {
        try {
            const userId = req.user.id;
            const { page, limit, isRead } = req.query;
            const result = await (0, get_notifications_service_1.getNotificationsService)({
                userId,
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 10,
                isRead: isRead ? isRead === "true" : undefined,
            });
            (0, async_handler_middleware_1.successResponse)(res, result, "Notifications retrieved successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    async markAsReadController(req, res) {
        try {
            const userId = req.user.id;
            const { notificationId, markAll } = req.body;
            const result = await (0, mark_as_read_service_1.markAsReadService)({
                userId,
                notificationId,
                markAll,
            });
            (0, async_handler_middleware_1.successResponse)(res, result, "Notifications marked as read");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    async getUnreadCountController(req, res) {
        try {
            const userId = req.user.id;
            const count = await (0, whatsapp_order_notification_service_1.getUnreadNotificationCountService)(userId);
            (0, async_handler_middleware_1.successResponse)(res, { unreadCount: count }, "Unread count retrieved successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
}
exports.NotificationController = NotificationController;
