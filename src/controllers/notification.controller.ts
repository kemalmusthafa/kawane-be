import { Request, Response } from "express";
import { getNotificationsService } from "../services/notification/get-notifications.service";
import { markAsReadService } from "../services/notification/mark-as-read.service";
import { getUnreadNotificationCountService } from "../services/notification/whatsapp-order-notification.service";
import {
  successResponse,
  errorResponse,
} from "../middlewares/async-handler.middleware";

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export class NotificationController {
  async getNotificationsController(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { page, limit, isRead } = req.query;

      const result = await getNotificationsService({
        userId,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        isRead: isRead ? isRead === "true" : undefined,
      });

      successResponse(res, result, "Notifications retrieved successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async markAsReadController(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { notificationId, markAll } = req.body;

      const result = await markAsReadService({
        userId,
        notificationId,
        markAll,
      });

      successResponse(res, result, "Notifications marked as read");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async getUnreadCountController(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      const count = await getUnreadNotificationCountService(userId);

      successResponse(
        res,
        { unreadCount: count },
        "Unread count retrieved successfully"
      );
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }
}
