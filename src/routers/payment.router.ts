import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { requireAuth, requireStaff } from "../middlewares/auth.middleware";
import {
  validateBody,
  validateParams,
} from "../middlewares/zod-validation.middleware";
import {
  createPaymentSchema,
  updatePaymentStatusSchema,
  idParamSchema,
} from "../utils/validation-schemas";

export class PaymentRouter {
  private router: Router;
  private paymentController: PaymentController;

  constructor() {
    this.router = Router();
    this.paymentController = new PaymentController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get payments (Customer sees own payments, Staff/Admin see all)
    this.router.get(
      "/",
      requireAuth,
      this.paymentController.getPaymentsController
    );

    // Create new payment
    this.router.post(
      "/",
      requireAuth,
      validateBody(createPaymentSchema),
      this.paymentController.createPaymentController
    );

    // Update payment status (Staff/Admin only)
    this.router.put(
      "/:paymentId/status",
      requireAuth,
      requireStaff,
      validateParams(idParamSchema),
      validateBody(updatePaymentStatusSchema),
      this.paymentController.updatePaymentStatusController
    );

    // Midtrans webhook (no auth required)
    this.router.post(
      "/midtrans-webhook",
      this.paymentController.midtransWebhookController
    );

    // Manual payment status update for testing (no auth required)
    this.router.post(
      "/test-webhook",
      this.paymentController.midtransWebhookController
    );

    // Manual order status update for testing (no auth required)
    this.router.post(
      "/update-order-status",
      this.paymentController.updateOrderStatusManuallyController
    );

    // Development webhook endpoint (bypasses signature verification)
    this.router.post(
      "/dev-webhook",
      this.paymentController.devWebhookController
    );

    // Development endpoint to list orders (no auth required)
    this.router.get(
      "/dev-orders",
      this.paymentController.devListOrdersController
    );

    // Webhook health check endpoint
    this.router.get(
      "/webhook-health",
      this.paymentController.webhookHealthCheckController
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
