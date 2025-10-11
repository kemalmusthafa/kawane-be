import { Router } from "express";
import { AdminNotificationController } from "../controllers/admin-notification.controller";
import { requireAuth, requireAdmin } from "../middlewares/auth.middleware";
import {
  validateQuery,
  validateBody,
} from "../middlewares/zod-validation.middleware";
import { z } from "zod";

const adminNotificationQuerySchema = z.object({
  page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(10),
  search: z.string().optional(),
  isRead: z.coerce.boolean().optional(),
});

const sendGeneralNotificationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  type: z.enum(["INFO", "WARNING", "ERROR", "SUCCESS"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  target: z.enum(["ALL", "ADMIN", "CUSTOMER"]),
});

const markAsReadSchema = z.object({
  notificationId: z.string().min(1, "Notification ID is required"),
});

const deleteNotificationSchema = z.object({
  notificationId: z.string().min(1, "Notification ID is required"),
});

export class AdminNotificationRouter {
  private router: Router;
  private adminNotificationController: AdminNotificationController;

  constructor() {
    this.router = Router();
    this.adminNotificationController = new AdminNotificationController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get all notifications for admin with search
    this.router.get(
      "/",
      requireAuth,
      requireAdmin,
      validateQuery(adminNotificationQuerySchema),
      this.adminNotificationController.getAdminNotificationsController
    );

    // Send general notification
    this.router.post(
      "/",
      requireAuth,
      requireAdmin,
      validateBody(sendGeneralNotificationSchema),
      this.adminNotificationController.sendGeneralNotificationController
    );

    // Mark notification as read
    this.router.post(
      "/mark-read",
      requireAuth,
      requireAdmin,
      validateBody(markAsReadSchema),
      this.adminNotificationController.markNotificationAsReadController
    );

    // Delete notification
    this.router.delete(
      "/:notificationId",
      requireAuth,
      requireAdmin,
      this.adminNotificationController.deleteNotificationController
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
