import { Router } from "express";
import { CustomerNotificationController } from "../controllers/customer-notification.controller";
import { requireAuth, requireAdmin } from "../middlewares/auth.middleware";
import {
  validateBody,
  validateQuery,
} from "../middlewares/zod-validation.middleware";
import {
  productLaunchNotificationSchema,
  wishlistNotificationSchema,
  flashSaleNotificationSchema,
  notificationQuerySchema,
} from "../utils/validation-schemas";

export class CustomerNotificationRouter {
  private router: Router;
  private customerNotificationController: CustomerNotificationController;

  constructor() {
    this.router = Router();
    this.customerNotificationController = new CustomerNotificationController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // 🔔 ADMIN ENDPOINTS (untuk mengirim notifikasi ke customer)

    // Send product launch notification (Admin only)
    this.router.post(
      "/send-product-launch",
      requireAuth,
      requireAdmin,
      validateBody(productLaunchNotificationSchema),
      this.customerNotificationController
        .sendProductLaunchNotificationController
    );

    // Send wishlist notification (Admin only)
    this.router.post(
      "/send-wishlist-notification",
      requireAuth,
      requireAdmin,
      validateBody(wishlistNotificationSchema),
      this.customerNotificationController.sendWishlistNotificationController
    );

    // Send flash sale notification (Admin only)
    this.router.post(
      "/send-flash-sale",
      requireAuth,
      requireAdmin,
      validateBody(flashSaleNotificationSchema),
      this.customerNotificationController.sendFlashSaleNotificationController
    );

    // 📱 CUSTOMER ENDPOINTS (untuk melihat notifikasi)

    // Get order tracking notifications (Customer only)
    this.router.get(
      "/order-tracking",
      requireAuth,
      validateQuery(notificationQuerySchema),
      this.customerNotificationController
        .getOrderTrackingNotificationsController
    );

    // Get product notifications (Customer only)
    this.router.get(
      "/product-notifications",
      requireAuth,
      validateQuery(notificationQuerySchema),
      this.customerNotificationController.getProductNotificationsController
    );

    // Get unread notification count (Customer only)
    this.router.get(
      "/unread-count",
      requireAuth,
      this.customerNotificationController.getUnreadNotificationCountController
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
