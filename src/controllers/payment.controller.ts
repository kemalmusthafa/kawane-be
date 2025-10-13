import { Request, Response } from "express";
import { createPaymentService } from "../services/payment/create-payment.service";
import { updatePaymentStatusService } from "../services/payment/update-payment-status.service";
import { getPaymentsService } from "../services/payment/get-payments.service";
import { handleMidtransWebhook } from "../services/payment/midtrans-webhook.service";
import { appConfig } from "../utils/config";
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

export class PaymentController {
  async getPaymentsController(req: AuthRequest, res: Response) {
    try {
      const { orderId, status, page, limit, startDate, endDate } = req.query;
      const userId = req.user?.role === "CUSTOMER" ? req.user.id : undefined;

      const result = await getPaymentsService({
        userId,
        orderId: orderId as string,
        status: status as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        startDate: startDate as string,
        endDate: endDate as string,
      });

      successResponse(res, result, "Payments retrieved successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async createPaymentController(req: Request, res: Response) {
    try {
      const payment = await createPaymentService(req.body);
      successResponse(res, payment, "Payment created successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async updatePaymentStatusController(req: Request, res: Response) {
    try {
      const { paymentId } = req.params;

      const payment = await updatePaymentStatusService({
        paymentId,
        ...req.body,
      });

      successResponse(res, payment, "Payment status updated successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async midtransWebhookController(req: Request, res: Response) {
    try {
      console.log("🔔 Midtrans webhook received:", {
        headers: req.headers,
        body: req.body,
        timestamp: new Date().toISOString(),
      });

      // Validate request body
      if (!req.body || Object.keys(req.body).length === 0) {
        console.error("❌ Empty webhook body received");
        return errorResponse(res, "Empty webhook body", 400);
      }

      const result = await handleMidtransWebhook(req.body);

      if (result.success) {
        console.log("✅ Webhook processed successfully:", result.data);
        return successResponse(res, result.data, result.message);
      } else {
        console.error("❌ Webhook processing failed:", result.message);
        return errorResponse(res, result.message, 400);
      }
    } catch (error: any) {
      console.error("💥 Midtrans webhook controller error:", {
        error: error.message,
        stack: error.stack,
        body: req.body,
        timestamp: new Date().toISOString(),
      });
      return errorResponse(res, error.message, 500);
    }
  }

  async updateOrderStatusManuallyController(req: Request, res: Response) {
    try {
      const { orderId, status } = req.body;

      if (!orderId || !status) {
        return errorResponse(res, "Order ID and status are required", 400);
      }

      // Import the service
      const { updateOrderStatusService } = await import(
        "../services/order/update-order-status.service"
      );

      const result = await updateOrderStatusService({
        orderId,
        status: status as any,
      });

      successResponse(res, result, "Order status updated successfully");
    } catch (error: any) {
      console.error("Manual order status update error:", error);
      errorResponse(res, error.message, 500);
    }
  }

  async devWebhookController(req: Request, res: Response) {
    try {
      // Import the service but bypass signature verification
      const { handleMidtransWebhook } = await import(
        "../services/payment/midtrans-webhook.service"
      );

      // Create a modified webhook data that bypasses signature verification
      const webhookData = {
        ...req.body,
        // Add a flag to bypass signature verification in development
        _bypassSignature: true,
      };

      const result = await handleMidtransWebhook(webhookData);

      if (result.success) {
        successResponse(res, result.data, result.message);
      } else {
        errorResponse(res, result.message, 400);
      }
    } catch (error: any) {
      console.error("Dev webhook controller error:", error);
      errorResponse(res, error.message, 500);
    }
  }

  async devListOrdersController(req: Request, res: Response) {
    try {
      // Import the service
      const { getAllOrdersService } = await import(
        "../services/order/get-all-orders.service"
      );

      const result = await getAllOrdersService({
        page: 1,
        limit: 10,
      });

      successResponse(res, result, "Orders retrieved successfully");
    } catch (error: any) {
      console.error("Dev list orders error:", error);
      errorResponse(res, error.message, 500);
    }
  }

  async webhookHealthCheckController(req: Request, res: Response) {
    try {
      const healthStatus = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        webhookEndpoint: "/api/payments/midtrans-webhook",
        environment: process.env.NODE_ENV || "development",
        midtransConfigured: !!process.env.MIDTRANS_SERVER_KEY,
        databaseConnected: true, // You can add actual DB check here
      };

      successResponse(res, healthStatus, "Webhook health check successful");
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async midtransConfigController(req: Request, res: Response) {
    try {
      const config = {
        isProduction: appConfig.MIDTRANS_IS_PRODUCTION,
        hasServerKey: !!appConfig.MIDTRANS_SERVER_KEY,
        hasClientKey: !!appConfig.MIDTRANS_CLIENT_KEY,
        serverKeyPrefix:
          appConfig.MIDTRANS_SERVER_KEY?.substring(0, 10) + "...",
        clientKeyPrefix:
          appConfig.MIDTRANS_CLIENT_KEY?.substring(0, 10) + "...",
        corsOrigin: appConfig.CORS_ORIGIN,
        webhookUrl:
          "https://kawane-be.vercel.app/api/payments/midtrans-webhook",
        redirectUrls: {
          success: "https://kawane-fe.vercel.app/payment/success",
          error: "https://kawane-fe.vercel.app/payment/error",
          pending: "https://kawane-fe.vercel.app/payment/pending",
        },
      };

      return successResponse(res, config, "Midtrans configuration");
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  }
}
