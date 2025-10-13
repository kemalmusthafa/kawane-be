"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminToolsRouter = void 0;
// routers/admin-tools.router.ts
const express_1 = require("express");
const rate_limit_utils_1 = require("../utils/rate-limit-utils");
const config_1 = require("../utils/config");
const prisma_1 = __importDefault(require("../prisma"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
class AdminToolsRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Production-ready admin tools with authentication
        // Apply admin authentication to all admin tool routes
        this.router.use(auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin);
        // Clear rate limit for specific IP
        this.router.post("/rate-limit/clear/:ip", async (req, res) => {
            try {
                const { ip } = req.params;
                await (0, rate_limit_utils_1.clearRateLimit)(ip);
                res.json({
                    success: true,
                    message: `Rate limit cleared for IP: ${ip}`,
                });
            }
            catch (error) {
                res
                    .status(500)
                    .json({ success: false, message: "Failed to clear rate limit" });
            }
        });
        // Clear all rate limits
        this.router.post("/rate-limit/clear-all", async (req, res) => {
            try {
                await (0, rate_limit_utils_1.clearAllRateLimits)();
                res.json({ success: true, message: "All rate limits cleared" });
            }
            catch (error) {
                res
                    .status(500)
                    .json({ success: false, message: "Failed to clear rate limits" });
            }
        });
        // Get rate limit status
        this.router.get("/rate-limit/status/:ip", async (req, res) => {
            try {
                const { ip } = req.params;
                const status = await (0, rate_limit_utils_1.getRateLimitStatus)(ip);
                res.json({ success: true, data: status });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: "Failed to get rate limit status",
                });
            }
        });
        // Health check
        this.router.get("/health", (req, res) => {
            res.json({
                success: true,
                message: "Admin tools server is running",
                environment: config_1.appConfig.NODE_ENV,
                timestamp: new Date().toISOString(),
            });
        });
        // Fix orders without payment records
        this.router.post("/fix-orders-payments", async (req, res) => {
            try {
                // Find orders without payment records
                const ordersWithoutPayments = await prisma_1.default.order.findMany({
                    where: {
                        payment: null,
                    },
                    select: {
                        id: true,
                        totalAmount: true,
                        status: true,
                        createdAt: true,
                    },
                });
                console.log(`Found ${ordersWithoutPayments.length} orders without payment records`);
                const fixedPayments = [];
                for (const order of ordersWithoutPayments) {
                    try {
                        const payment = await prisma_1.default.payment.create({
                            data: {
                                orderId: order.id,
                                method: "MIDTRANS",
                                amount: order.totalAmount,
                                status: "PENDING",
                            },
                        });
                        fixedPayments.push({
                            orderId: order.id,
                            paymentId: payment.id,
                            amount: order.totalAmount,
                        });
                        console.log(`✅ Created payment for order ${order.id}`);
                    }
                    catch (error) {
                        console.error(`❌ Failed to create payment for order ${order.id}:`, error);
                    }
                }
                res.json({
                    success: true,
                    message: `Fixed ${fixedPayments.length} orders`,
                    data: {
                        totalOrders: ordersWithoutPayments.length,
                        fixedPayments: fixedPayments.length,
                        payments: fixedPayments,
                    },
                });
            }
            catch (error) {
                console.error("Error fixing orders:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to fix orders",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        });
    }
    getRouter() {
        return this.router;
    }
}
exports.AdminToolsRouter = AdminToolsRouter;
