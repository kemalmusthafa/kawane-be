"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerNotificationController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const product_launch_notification_service_1 = require("../services/notification/product-launch-notification.service");
const product_launch_notification_service_2 = require("../services/notification/product-launch-notification.service");
const product_launch_notification_service_3 = require("../services/notification/product-launch-notification.service");
const async_handler_middleware_1 = require("../middlewares/async-handler.middleware");
class CustomerNotificationController {
    // Send product launch notification to all customers
    async sendProductLaunchNotificationController(req, res) {
        try {
            const { productId, title, message } = req.body;
            const result = await (0, product_launch_notification_service_1.sendProductLaunchNotificationService)({
                productId,
                title,
                message,
            });
            (0, async_handler_middleware_1.successResponse)(res, result, "Product launch notification sent successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    // Send wishlist notification (back in stock, discount, price drop)
    async sendWishlistNotificationController(req, res) {
        try {
            const { productId, notificationType } = req.body;
            const result = await (0, product_launch_notification_service_2.sendWishlistProductNotificationService)(productId, notificationType);
            (0, async_handler_middleware_1.successResponse)(res, result, "Wishlist notification sent successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    // Send flash sale notification
    async sendFlashSaleNotificationController(req, res) {
        try {
            const { productIds, discountPercentage, endTime } = req.body;
            const result = await (0, product_launch_notification_service_3.sendFlashSaleNotificationService)(productIds, discountPercentage, new Date(endTime));
            (0, async_handler_middleware_1.successResponse)(res, result, "Flash sale notification sent successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    // Get customer's order tracking notifications
    async getOrderTrackingNotificationsController(req, res) {
        try {
            const userId = req.user.id;
            const queryData = req.validatedQuery || req.query;
            const { page = 1, limit = 10, type } = queryData;
            const skip = (parseInt(page) - 1) * parseInt(limit);
            // Build where clause
            const where = {
                userId,
                type: {
                    in: [
                        "ORDER_UPDATE",
                        "ORDER_SHIPPED",
                        "ORDER_DELIVERED",
                        "ORDER_CANCELLED",
                    ],
                },
            };
            if (type) {
                where.type = type;
            }
            const [notifications, total] = await Promise.all([
                prisma_1.default.notification.findMany({
                    where,
                    orderBy: { createdAt: "desc" },
                    skip,
                    take: parseInt(limit),
                }),
                prisma_1.default.notification.count({ where }),
            ]);
            const totalPages = Math.ceil(total / parseInt(limit));
            (0, async_handler_middleware_1.successResponse)(res, {
                notifications,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages,
                    hasNextPage: parseInt(page) < totalPages,
                    hasPrevPage: parseInt(page) > 1,
                },
            }, "Order tracking notifications retrieved successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
    // Get customer's product notifications (new products, flash sales, etc.)
    async getProductNotificationsController(req, res) {
        try {
            const userId = req.user.id;
            const queryData = req.validatedQuery || req.query;
            const { page = 1, limit = 10, type } = queryData;
            const skip = (parseInt(page) - 1) * parseInt(limit);
            // Build where clause
            const where = {
                userId,
                type: {
                    in: ["PRODUCT_LAUNCH", "WISHLIST_UPDATE", "FLASH_SALE"],
                },
            };
            if (type) {
                where.type = type;
            }
            const [notifications, total] = await Promise.all([
                prisma_1.default.notification.findMany({
                    where,
                    orderBy: { createdAt: "desc" },
                    skip,
                    take: parseInt(limit),
                }),
                prisma_1.default.notification.count({ where }),
            ]);
            const totalPages = Math.ceil(total / parseInt(limit));
            (0, async_handler_middleware_1.successResponse)(res, {
                notifications,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages,
                    hasNextPage: parseInt(page) < totalPages,
                    hasPrevPage: parseInt(page) > 1,
                },
            }, "Product notifications retrieved successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
    // Get unread notification count for customer
    async getUnreadNotificationCountController(req, res) {
        try {
            const userId = req.user.id;
            const unreadCount = await prisma_1.default.notification.count({
                where: {
                    userId,
                    isRead: false,
                },
            });
            (0, async_handler_middleware_1.successResponse)(res, { unreadCount }, "Unread notification count retrieved successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
}
exports.CustomerNotificationController = CustomerNotificationController;
