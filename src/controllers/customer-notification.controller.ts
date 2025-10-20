import { Request, Response } from "express";
import prisma from "../prisma";
import { sendProductLaunchNotificationService } from "../services/notification/product-launch-notification.service";
import { sendWishlistProductNotificationService } from "../services/notification/product-launch-notification.service";
import { sendFlashSaleNotificationService } from "../services/notification/product-launch-notification.service";
import {
  successResponse,
  errorResponse,
} from "../middlewares/async-handler.middleware";

export class CustomerNotificationController {
  // Send product launch notification to all customers
  async sendProductLaunchNotificationController(req: Request, res: Response) {
    try {
      const { productId, title, message } = req.body;
      const result = await sendProductLaunchNotificationService({
        productId,
        title,
        message,
      });
      successResponse(
        res,
        result,
        "Product launch notification sent successfully"
      );
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  // Send wishlist notification (back in stock, discount, price drop)
  async sendWishlistNotificationController(req: Request, res: Response) {
    try {
      const { productId, notificationType } = req.body;
      const result = await sendWishlistProductNotificationService(
        productId,
        notificationType
      );
      successResponse(res, result, "Wishlist notification sent successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  // Send flash sale notification
  async sendFlashSaleNotificationController(req: Request, res: Response) {
    try {
      const { productIds, discountPercentage, endTime } = req.body;
      const result = await sendFlashSaleNotificationService(
        productIds,
        discountPercentage,
        new Date(endTime)
      );
      successResponse(res, result, "Flash sale notification sent successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  // Get customer's order tracking notifications
  async getOrderTrackingNotificationsController(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const queryData = (req as any).validatedQuery || req.query;
      const { page = 1, limit = 10, type } = queryData;

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      // Build where clause
      const where: any = {
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
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: parseInt(limit as string),
        }),
        prisma.notification.count({ where }),
      ]);

      const totalPages = Math.ceil(total / parseInt(limit as string));

      successResponse(
        res,
        {
          notifications,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total,
            totalPages,
            hasNextPage: parseInt(page as string) < totalPages,
            hasPrevPage: parseInt(page as string) > 1,
          },
        },
        "Order tracking notifications retrieved successfully"
      );
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  // Get customer's product notifications (new products, flash sales, etc.)
  async getProductNotificationsController(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const queryData = (req as any).validatedQuery || req.query;
      const { page = 1, limit = 10, type } = queryData;

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      // Build where clause
      const where: any = {
        userId,
        type: {
          in: ["PRODUCT_LAUNCH", "WISHLIST_UPDATE", "FLASH_SALE"],
        },
      };

      if (type) {
        where.type = type;
      }

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: parseInt(limit as string),
        }),
        prisma.notification.count({ where }),
      ]);

      const totalPages = Math.ceil(total / parseInt(limit as string));

      successResponse(
        res,
        {
          notifications,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total,
            totalPages,
            hasNextPage: parseInt(page as string) < totalPages,
            hasPrevPage: parseInt(page as string) > 1,
          },
        },
        "Product notifications retrieved successfully"
      );
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  // Get unread notification count for customer
  async getUnreadNotificationCountController(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      const unreadCount = await prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      });

      successResponse(
        res,
        { unreadCount },
        "Unread notification count retrieved successfully"
      );
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }
}
