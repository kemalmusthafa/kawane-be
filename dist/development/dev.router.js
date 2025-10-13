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
        // Seed users endpoint (no auth required for initial setup)
        this.router.post("/seed-users", async (req, res) => {
            try {
                const { hash } = await Promise.resolve().then(() => __importStar(require("bcrypt")));
                // Create Admin User
                const adminPassword = await hash("Admin123!", 10);
                const admin = await prisma_1.default.user.upsert({
                    where: { email: "admin@kawane.com" },
                    update: {},
                    create: {
                        name: "Admin Kawane",
                        email: "admin@kawane.com",
                        password: adminPassword,
                        role: "ADMIN",
                        isVerified: true,
                        isDeleted: false,
                    },
                });
                // Create Staff User
                const staffPassword = await hash("Staff123!", 10);
                const staff = await prisma_1.default.user.upsert({
                    where: { email: "staff@kawane.com" },
                    update: {},
                    create: {
                        name: "Staff Kawane",
                        email: "staff@kawane.com",
                        password: staffPassword,
                        role: "STAFF",
                        isVerified: true,
                        isDeleted: false,
                    },
                });
                // Create Test Customers
                const customerPassword = await hash("Customer123!", 10);
                const customer1 = await prisma_1.default.user.upsert({
                    where: { email: "customer@kawane.com" },
                    update: {},
                    create: {
                        name: "Test Customer",
                        email: "customer@kawane.com",
                        password: customerPassword,
                        role: "CUSTOMER",
                        isVerified: true,
                        isDeleted: false,
                    },
                });
                const customer2 = await prisma_1.default.user.upsert({
                    where: { email: "john@example.com" },
                    update: {},
                    create: {
                        name: "John Doe",
                        email: "john@example.com",
                        password: customerPassword,
                        role: "CUSTOMER",
                        isVerified: true,
                        isDeleted: false,
                    },
                });
                const customer3 = await prisma_1.default.user.upsert({
                    where: { email: "jane@example.com" },
                    update: {},
                    create: {
                        name: "Jane Smith",
                        email: "jane@example.com",
                        password: customerPassword,
                        role: "CUSTOMER",
                        isVerified: true,
                        isDeleted: false,
                    },
                });
                const customer4 = await prisma_1.default.user.upsert({
                    where: { email: "budi@example.com" },
                    update: {},
                    create: {
                        name: "Budi Santoso",
                        email: "budi@example.com",
                        password: customerPassword,
                        role: "CUSTOMER",
                        isVerified: true,
                        isDeleted: false,
                    },
                });
                const customer5 = await prisma_1.default.user.upsert({
                    where: { email: "sari@example.com" },
                    update: {},
                    create: {
                        name: "Sari Indah",
                        email: "sari@example.com",
                        password: customerPassword,
                        role: "CUSTOMER",
                        isVerified: true,
                        isDeleted: false,
                    },
                });
                res.json({
                    success: true,
                    message: "Users seeded successfully",
                    data: {
                        totalUsers: 7,
                        users: [
                            { email: "admin@kawane.com", role: "ADMIN" },
                            { email: "staff@kawane.com", role: "STAFF" },
                            { email: "customer@kawane.com", role: "CUSTOMER" },
                            { email: "john@example.com", role: "CUSTOMER" },
                            { email: "jane@example.com", role: "CUSTOMER" },
                            { email: "budi@example.com", role: "CUSTOMER" },
                            { email: "sari@example.com", role: "CUSTOMER" },
                        ],
                    },
                });
            }
            catch (error) {
                console.error("Error seeding users:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to seed users",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        });
        // Apply admin authentication to all other admin tool routes
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
