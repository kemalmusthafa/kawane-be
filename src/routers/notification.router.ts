import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import {
  validateQuery,
  validateBody,
} from "../middlewares/zod-validation.middleware";
import {
  notificationQuerySchema,
  markAsReadSchema,
} from "../utils/validation-schemas";

export class NotificationRouter {
  private router: Router;
  private notificationController: NotificationController;

  constructor() {
    this.router = Router();
    this.notificationController = new NotificationController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get user notifications with pagination
    this.router.get(
      "/",
      requireAuth,
      validateQuery(notificationQuerySchema),
      this.notificationController.getNotificationsController
    );

    // Get unread notification count
    this.router.get(
      "/unread-count",
      requireAuth,
      this.notificationController.getUnreadCountController
    );

    // Mark notifications as read
    this.router.post(
      "/mark-read",
      requireAuth,
      validateBody(markAsReadSchema),
      this.notificationController.markAsReadController
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
