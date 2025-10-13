"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const create_payment_service_1 = require("../services/payment/create-payment.service");
const update_payment_status_service_1 = require("../services/payment/update-payment-status.service");
const get_payments_service_1 = require("../services/payment/get-payments.service");
const midtrans_webhook_service_1 = require("../services/payment/midtrans-webhook.service");
const config_1 = require("../utils/config");
const async_handler_middleware_1 = require("../middlewares/async-handler.middleware");
class PaymentController {
    async getPaymentsController(req, res) {
        try {
            const { orderId, status, page, limit, startDate, endDate } = req.query;
            const userId = req.user?.role === "CUSTOMER" ? req.user.id : undefined;
            const result = await (0, get_payments_service_1.getPaymentsService)({
                userId,
                orderId: orderId,
                status: status,
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 10,
                startDate: startDate,
                endDate: endDate,
            });
            (0, async_handler_middleware_1.successResponse)(res, result, "Payments retrieved successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    async createPaymentController(req, res) {
        try {
            const payment = await (0, create_payment_service_1.createPaymentService)(req.body);
            (0, async_handler_middleware_1.successResponse)(res, payment, "Payment created successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    async updatePaymentStatusController(req, res) {
        try {
            const { paymentId } = req.params;
            const payment = await (0, update_payment_status_service_1.updatePaymentStatusService)({
                paymentId,
                ...req.body,
            });
            (0, async_handler_middleware_1.successResponse)(res, payment, "Payment status updated successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    async midtransWebhookController(req, res) {
        try {
            console.log("🔔 Midtrans webhook received:", {
                headers: req.headers,
                body: req.body,
                timestamp: new Date().toISOString(),
            });
            // Validate request body
            if (!req.body || Object.keys(req.body).length === 0) {
                console.error("❌ Empty webhook body received");
                return (0, async_handler_middleware_1.errorResponse)(res, "Empty webhook body", 400);
            }
            const result = await (0, midtrans_webhook_service_1.handleMidtransWebhook)(req.body);
            if (result.success) {
                console.log("✅ Webhook processed successfully:", result.data);
                return (0, async_handler_middleware_1.successResponse)(res, result.data, result.message);
            }
            else {
                console.error("❌ Webhook processing failed:", result.message);
                return (0, async_handler_middleware_1.errorResponse)(res, result.message, 400);
            }
        }
        catch (error) {
            console.error("💥 Midtrans webhook controller error:", {
                error: error.message,
                stack: error.stack,
                body: req.body,
                timestamp: new Date().toISOString(),
            });
            return (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
    async updateOrderStatusManuallyController(req, res) {
        try {
            const { orderId, status } = req.body;
            if (!orderId || !status) {
                return (0, async_handler_middleware_1.errorResponse)(res, "Order ID and status are required", 400);
            }
            // Import the service
            const { updateOrderStatusService } = await Promise.resolve().then(() => __importStar(require("../services/order/update-order-status.service")));
            const result = await updateOrderStatusService({
                orderId,
                status: status,
            });
            (0, async_handler_middleware_1.successResponse)(res, result, "Order status updated successfully");
        }
        catch (error) {
            console.error("Manual order status update error:", error);
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
    async devWebhookController(req, res) {
        try {
            // Import the service but bypass signature verification
            const { handleMidtransWebhook } = await Promise.resolve().then(() => __importStar(require("../services/payment/midtrans-webhook.service")));
            // Create a modified webhook data that bypasses signature verification
            const webhookData = {
                ...req.body,
                // Add a flag to bypass signature verification in development
                _bypassSignature: true,
            };
            const result = await handleMidtransWebhook(webhookData);
            if (result.success) {
                (0, async_handler_middleware_1.successResponse)(res, result.data, result.message);
            }
            else {
                (0, async_handler_middleware_1.errorResponse)(res, result.message, 400);
            }
        }
        catch (error) {
            console.error("Dev webhook controller error:", error);
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
    async devListOrdersController(req, res) {
        try {
            // Import the service
            const { getAllOrdersService } = await Promise.resolve().then(() => __importStar(require("../services/order/get-all-orders.service")));
            const result = await getAllOrdersService({
                page: 1,
                limit: 10,
            });
            (0, async_handler_middleware_1.successResponse)(res, result, "Orders retrieved successfully");
        }
        catch (error) {
            console.error("Dev list orders error:", error);
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
    async webhookHealthCheckController(req, res) {
        try {
            const healthStatus = {
                status: "healthy",
                timestamp: new Date().toISOString(),
                webhookEndpoint: "/api/payments/midtrans-webhook",
                environment: process.env.NODE_ENV || "development",
                midtransConfigured: !!process.env.MIDTRANS_SERVER_KEY,
                databaseConnected: true, // You can add actual DB check here
            };
            (0, async_handler_middleware_1.successResponse)(res, healthStatus, "Webhook health check successful");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
    async midtransConfigController(req, res) {
        try {
            const config = {
                isProduction: config_1.appConfig.MIDTRANS_IS_PRODUCTION,
                hasServerKey: !!config_1.appConfig.MIDTRANS_SERVER_KEY,
                hasClientKey: !!config_1.appConfig.MIDTRANS_CLIENT_KEY,
                serverKeyPrefix: config_1.appConfig.MIDTRANS_SERVER_KEY?.substring(0, 10) + "...",
                clientKeyPrefix: config_1.appConfig.MIDTRANS_CLIENT_KEY?.substring(0, 10) + "...",
                corsOrigin: config_1.appConfig.CORS_ORIGIN,
                webhookUrl: "https://kawane-be.vercel.app/api/payments/midtrans-webhook",
                redirectUrls: {
                    success: "https://kawane-fe.vercel.app/payment/success",
                    error: "https://kawane-fe.vercel.app/payment/error",
                    pending: "https://kawane-fe.vercel.app/payment/pending",
                },
            };
            return (0, async_handler_middleware_1.successResponse)(res, config, "Midtrans configuration");
        }
        catch (error) {
            return (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
    async createMidtransTokenController(req, res) {
        try {
            const { orderId, amount, customerDetails, paymentMethod } = req.body;
            if (!orderId || !amount || !customerDetails) {
                return (0, async_handler_middleware_1.errorResponse)(res, "Missing required fields", 400);
            }
            // Import MidtransService
            const { MidtransService } = await Promise.resolve().then(() => __importStar(require("../services/payment/midtrans.service")));
            const midtransData = {
                orderId,
                amount,
                customerDetails: {
                    firstName: customerDetails.name?.split(" ")[0] || customerDetails.name,
                    lastName: customerDetails.name?.split(" ").slice(1).join(" ") || "",
                    email: customerDetails.email,
                    phone: customerDetails.phone || "08123456789",
                },
                shippingAddress: {
                    firstName: customerDetails.name?.split(" ")[0] || customerDetails.name,
                    lastName: customerDetails.name?.split(" ").slice(1).join(" ") || "",
                    address: customerDetails.address || "Default Address",
                    city: customerDetails.city || "Jakarta",
                    postalCode: customerDetails.postalCode || "12345",
                    phone: customerDetails.phone || "08123456789",
                },
                itemDetails: [
                    {
                        id: orderId,
                        price: amount,
                        quantity: 1,
                        name: `Order ${orderId}`,
                    },
                ],
            };
            const result = await MidtransService.createPayment(midtransData);
            return (0, async_handler_middleware_1.successResponse)(res, {
                token: result.token,
                redirectUrl: result.redirectUrl,
            }, "Midtrans token created successfully");
        }
        catch (error) {
            console.error("Create Midtrans token error:", error);
            return (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
}
exports.PaymentController = PaymentController;
