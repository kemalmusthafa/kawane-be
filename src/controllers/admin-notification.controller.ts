import { Request, Response } from "express";
import { getAdminNotificationsService } from "../services/notification/get-admin-notifications.service";
import { sendGeneralNotificationService } from "../services/notification/send-general-notification.service";
import { markAsReadService } from "../services/notification/mark-as-read.service";
import prisma from "../prisma";
import {
  successResponse,
  errorResponse,
} from "../middlewares/async-handler.middleware";

export class AdminNotificationController {
  async getAdminNotificationsController(req: Request, res: Response) {
    try {
      const queryData = (req as any).validatedQuery || req.query;
      const { search, page, limit, isRead } = queryData;

      const result = await getAdminNotificationsService({
        search: search as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        isRead: isRead ? isRead === "true" : undefined,
      });

      successResponse(
        res,
        result,
        "Admin notifications retrieved successfully"
      );
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async sendGeneralNotificationController(req: Request, res: Response) {
    try {
      const { title, message, type, priority, target } = req.body;

      if (!title || !message || !type || !priority || !target) {
        return errorResponse(res, "All fields are required", 400);
      }

      const result = await sendGeneralNotificationService({
        title,
        message,
        type,
        priority,
        target,
      });

      successResponse(res, result, "General notification sent successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async getUnreadCountController(req: Request, res: Response) {
    try {
      const unreadCount = await prisma.notification.count({
        where: {
          isRead: false,
          isDeleted: false,
        },
      });

      successResponse(
        res,
        { unreadCount },
        "Unread count retrieved successfully"
      );
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async markNotificationAsReadController(req: Request, res: Response) {
    try {
      const { notificationId, markAll } = req.body;

      if (markAll) {
        // Mark all notifications as read
        await prisma.notification.updateMany({
          where: {
            isRead: false,
            isDeleted: false,
          },
          data: { isRead: true },
        });

        successResponse(
          res,
          { success: true },
          "All notifications marked as read"
        );
        return;
      }

      if (!notificationId) {
        return errorResponse(res, "Notification ID is required", 400);
      }

      // Check if notification exists
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
      });

      if (!notification) {
        return errorResponse(res, "Notification not found", 404);
      }

      // Mark as read
      await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });

      successResponse(res, { success: true }, "Notification marked as read");
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async deleteNotificationController(req: Request, res: Response) {
    try {
      const { notificationId } = req.params;

      if (!notificationId) {
        return errorResponse(res, "Notification ID is required", 400);
      }

      // Check if notification exists
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
      });

      if (!notification) {
        return errorResponse(res, "Notification not found", 404);
      }

      // Soft delete notification
      await prisma.notification.update({
        where: { id: notificationId },
        data: { isDeleted: true },
      });

      successResponse(
        res,
        { success: true },
        "Notification deleted successfully"
      );
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }
}
