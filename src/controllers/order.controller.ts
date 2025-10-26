import { Request, Response } from "express";
import { createOrderService } from "../services/order/create-order.service";
import { getUserOrdersService } from "../services/order/get-user-orders.service";
import { getAllOrdersService } from "../services/order/get-all-orders.service";
import { updateOrderStatusService } from "../services/order/update-order-status.service";
import { getOrderDetailService } from "../services/order/get-order-detail.service";
import { cancelOrderService } from "../services/order/cancel-order.service";
import { deleteOrderService } from "../services/order/delete-order.service";
import {
  createWhatsAppOrderService,
  updateWhatsAppOrderStatusService,
  getWhatsAppOrdersService,
} from "../services/order/whatsapp-order.service";
import { createAdminWhatsAppOrderNotificationService } from "../services/notification/order-notification.service";
import {
  successResponse,
  errorResponse,
} from "../middlewares/async-handler.middleware";
import prisma from "../prisma";

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export class OrderController {
  async createOrderController(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const {
        items,
        totalAmount,
        shippingAddress,
        paymentMethod,
        addressId,
        notes,
      } = req.body;

      // Handle address creation if addressId is null
      let finalAddressId = addressId;

      if (!addressId && shippingAddress) {
        // Create new address from shipping address string
        // Expected format: "street, city, postalCode, country"
        const addressParts = shippingAddress
          .split(",")
          .map((part: string) => part.trim());

        const newAddress = await prisma.address.create({
          data: {
            userId,
            detail: addressParts[0] || "",
            city: addressParts[1] || "",
            province: addressParts[3] || "Indonesia", // Use country as province if no province provided
            postalCode: addressParts[2] || "",
            isDefault: false,
          },
        });
        finalAddressId = newAddress.id;
      }

      if (!finalAddressId) {
        return errorResponse(res, "Address is required", 400);
      }

      // Use the existing createOrderService with multiple products
      const order = await createOrderService({
        userId,
        items: items,
        addressId: finalAddressId,
        totalAmount, // Pass totalAmount from frontend
      });

      successResponse(
        res,
        {
          orderId: order.id,
          orderNumber: order.id, // Using order ID as order number for now
          totalAmount: order.totalAmount,
          status: order.status,
          paymentUrl: order.paymentUrl,
          paymentToken: order.paymentToken,
        },
        "Order created successfully"
      );
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async getUserOrdersController(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      // Use validated query data if available, otherwise fallback to req.query
      const queryData = (req as any).validatedQuery || req.query;
      const { status, page, limit } = queryData;

      const result = await getUserOrdersService({
        userId,
        status: status as any,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
      });

      successResponse(res, result, "Orders retrieved successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async getAllOrdersController(req: AuthRequest, res: Response) {
    try {
      // Use validated query data if available, otherwise fallback to req.query
      const queryData = (req as any).validatedQuery || req.query;
      const { status, paymentStatus, page, limit, search } = queryData;

      const result = await getAllOrdersService({
        status: status as any,
        paymentStatus: paymentStatus as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        search: search as string,
      });

      successResponse(res, result, "All orders retrieved successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async updateOrderStatusController(req: AuthRequest, res: Response) {
    try {
      // Use validated params data if available, otherwise fallback to req.params
      const paramsData = (req as any).validatedParams || req.params;
      const { orderId } = paramsData;
      const { status } = req.body;

      const order = await updateOrderStatusService({
        orderId,
        status,
      });

      successResponse(res, order, "Order status updated successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async getOrderDetailController(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      // Use validated params data if available, otherwise fallback to req.params
      const paramsData = (req as any).validatedParams || req.params;
      const { orderId } = paramsData;

      const order = await getOrderDetailService({
        orderId,
        userId,
      });

      successResponse(res, order, "Order detail retrieved successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async cancelOrderController(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      // Use validated params data if available, otherwise fallback to req.params
      const paramsData = (req as any).validatedParams || req.params;
      const { orderId } = paramsData;

      const result = await cancelOrderService({
        orderId,
        userId,
      });

      successResponse(res, result, "Order cancelled successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async deleteOrderController(req: AuthRequest, res: Response) {
    try {
      // Use validated params data if available, otherwise fallback to req.params
      const paramsData = (req as any).validatedParams || req.params;
      const { orderId } = paramsData;

      const result = await deleteOrderService({
        orderId,
      });

      successResponse(res, result, "Order deleted successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  // WhatsApp Order Methods
  async createWhatsAppOrderController(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { items, shippingAddress, whatsappPhoneNumber, notes } = req.body;

      // Validate required fields
      if (!items || !shippingAddress || !whatsappPhoneNumber) {
        throw new Error("Missing required fields");
      }

      // Create WhatsApp order
      const result = await createWhatsAppOrderService({
        userId,
        items,
        shippingAddress,
        whatsappPhoneNumber,
        notes,
      });

      successResponse(
        res,
        {
          orderId: result.order.id,
          whatsappOrderId: result.order.whatsappOrderId,
          totalAmount: result.order.totalAmount,
          whatsappMessage: result.whatsappMessage,
          whatsappLink: result.whatsappLink,
          orderItems: result.order.items,
        },
        "WhatsApp order created successfully"
      );
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async updateWhatsAppOrderStatusController(req: AuthRequest, res: Response) {
    try {
      const { orderId } = req.params;
      const { status, adminNotes } = req.body;

      if (!orderId || !status) {
        throw new Error("Missing required fields");
      }

      const result = await updateWhatsAppOrderStatusService(
        orderId,
        status,
        adminNotes
      );

      successResponse(
        res,
        result,
        "WhatsApp order status updated successfully"
      );
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async getWhatsAppOrdersController(req: AuthRequest, res: Response) {
    try {
      const { status } = req.query;

      const orders = await getWhatsAppOrdersService(status as any);

      successResponse(res, orders, "WhatsApp orders retrieved successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }
}
