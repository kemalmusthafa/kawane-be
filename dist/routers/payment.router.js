"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRouter = void 0;
const express_1 = require("express");
const payment_controller_1 = require("../controllers/payment.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const zod_validation_middleware_1 = require("../middlewares/zod-validation.middleware");
const validation_schemas_1 = require("../utils/validation-schemas");
class PaymentRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.paymentController = new payment_controller_1.PaymentController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Get payments (Customer sees own payments, Staff/Admin see all)
        this.router.get("/", auth_middleware_1.requireAuth, this.paymentController.getPaymentsController);
        // Create new payment
        this.router.post("/", auth_middleware_1.requireAuth, (0, zod_validation_middleware_1.validateBody)(validation_schemas_1.createPaymentSchema), this.paymentController.createPaymentController);
        // Update payment status (Staff/Admin only)
        this.router.put("/:paymentId/status", auth_middleware_1.requireAuth, auth_middleware_1.requireStaff, (0, zod_validation_middleware_1.validateParams)(validation_schemas_1.idParamSchema), (0, zod_validation_middleware_1.validateBody)(validation_schemas_1.updatePaymentStatusSchema), this.paymentController.updatePaymentStatusController);
        // Midtrans webhook (no auth required)
        this.router.post("/midtrans-webhook", this.paymentController.midtransWebhookController);
        // Manual payment status update for testing (no auth required)
        this.router.post("/test-webhook", this.paymentController.midtransWebhookController);
        // Manual order status update for testing (no auth required)
        this.router.post("/update-order-status", this.paymentController.updateOrderStatusManuallyController);
        // Development webhook endpoint (bypasses signature verification)
        this.router.post("/dev-webhook", this.paymentController.devWebhookController);
        // Development endpoint to list orders (no auth required)
        this.router.get("/dev-orders", this.paymentController.devListOrdersController);
        // Webhook health check endpoint
        this.router.get("/webhook-health", this.paymentController.webhookHealthCheckController);
    }
    getRouter() {
        return this.router;
    }
}
exports.PaymentRouter = PaymentRouter;
