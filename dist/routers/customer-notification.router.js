"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerNotificationRouter = void 0;
const express_1 = require("express");
const customer_notification_controller_1 = require("../controllers/customer-notification.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const zod_validation_middleware_1 = require("../middlewares/zod-validation.middleware");
const validation_schemas_1 = require("../utils/validation-schemas");
class CustomerNotificationRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.customerNotificationController = new customer_notification_controller_1.CustomerNotificationController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // 🔔 ADMIN ENDPOINTS (untuk mengirim notifikasi ke customer)
        // Send product launch notification (Admin only)
        this.router.post("/send-product-launch", auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, (0, zod_validation_middleware_1.validateBody)(validation_schemas_1.productLaunchNotificationSchema), this.customerNotificationController
            .sendProductLaunchNotificationController);
        // Send wishlist notification (Admin only)
        this.router.post("/send-wishlist-notification", auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, (0, zod_validation_middleware_1.validateBody)(validation_schemas_1.wishlistNotificationSchema), this.customerNotificationController.sendWishlistNotificationController);
        // Send flash sale notification (Admin only)
        this.router.post("/send-flash-sale", auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, (0, zod_validation_middleware_1.validateBody)(validation_schemas_1.flashSaleNotificationSchema), this.customerNotificationController.sendFlashSaleNotificationController);
        // 📱 CUSTOMER ENDPOINTS (untuk melihat notifikasi)
        // Get order tracking notifications (Customer only)
        this.router.get("/order-tracking", auth_middleware_1.requireAuth, (0, zod_validation_middleware_1.validateQuery)(validation_schemas_1.notificationQuerySchema), this.customerNotificationController
            .getOrderTrackingNotificationsController);
        // Get product notifications (Customer only)
        this.router.get("/product-notifications", auth_middleware_1.requireAuth, (0, zod_validation_middleware_1.validateQuery)(validation_schemas_1.notificationQuerySchema), this.customerNotificationController.getProductNotificationsController);
        // Get unread notification count (Customer only)
        this.router.get("/unread-count", auth_middleware_1.requireAuth, this.customerNotificationController.getUnreadNotificationCountController);
    }
    getRouter() {
        return this.router;
    }
}
exports.CustomerNotificationRouter = CustomerNotificationRouter;
