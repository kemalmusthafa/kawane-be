import { Request, Response } from "express";
import { createOrderService } from "../services/order/create-order.service";
import { getUserOrdersService } from "../services/order/get-user-orders.service";
import { getAllOrdersService } from "../services/order/get-all-orders.service";
import { updateOrderStatusService } from "../services/order/update-order-status.service";
import { getOrderDetailService } from "../services/order/get-order-detail.service";
import { cancelOrderService } from "../services/order/cancel-order.service";
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

      // Use the existing createOrderService with multiple products
      const order = await createOrderService({
        userId,
        items: items,
        addressId: addressId || "temp-address", // We'll handle address creation in service
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
      const { status, page, limit, search } = queryData;

      const result = await getAllOrdersService({
        status: status as any,
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
}
