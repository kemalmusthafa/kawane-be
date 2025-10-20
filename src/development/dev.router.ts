// routers/admin-tools.router.ts
import { Router, Request, Response } from "express";
import {
  clearRateLimit,
  clearAllRateLimits,
  getRateLimitStatus,
} from "../utils/rate-limit-utils";
import { appConfig } from "../utils/config";
import prisma from "../prisma";
import {
  requireAuth,
  requireAdmin,
  AuthRequest,
} from "../middlewares/auth.middleware";

export class AdminToolsRouter {
  private router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Production-ready admin tools with authentication

    // Seed users endpoint (no auth required for initial setup)
    this.router.post("/seed-users", async (req: Request, res: Response) => {
      try {
        const { hash } = await import("bcrypt");

        // Create Admin User
        const adminPassword = await hash("Admin123!", 10);
        const admin = await prisma.user.upsert({
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
        const staff = await prisma.user.upsert({
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

        const customer1 = await prisma.user.upsert({
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

        const customer2 = await prisma.user.upsert({
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

        const customer3 = await prisma.user.upsert({
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

        const customer4 = await prisma.user.upsert({
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

        const customer5 = await prisma.user.upsert({
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
      } catch (error) {
        console.error("Error seeding users:", error);
        res.status(500).json({
          success: false,
          message: "Failed to seed users",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // Apply admin authentication to all other admin tool routes
    this.router.use(requireAuth, requireAdmin);

    // Clear rate limit for specific IP
    this.router.post(
      "/rate-limit/clear/:ip",
      async (req: Request, res: Response) => {
        try {
          const { ip } = req.params;
          await clearRateLimit(ip);
          res.json({
            success: true,
            message: `Rate limit cleared for IP: ${ip}`,
          });
        } catch (error) {
          res
            .status(500)
            .json({ success: false, message: "Failed to clear rate limit" });
        }
      }
    );

    // Clear all rate limits
    this.router.post(
      "/rate-limit/clear-all",
      async (req: Request, res: Response) => {
        try {
          await clearAllRateLimits();
          res.json({ success: true, message: "All rate limits cleared" });
        } catch (error) {
          res
            .status(500)
            .json({ success: false, message: "Failed to clear rate limits" });
        }
      }
    );

    // Get rate limit status
    this.router.get(
      "/rate-limit/status/:ip",
      async (req: Request, res: Response) => {
        try {
          const { ip } = req.params;
          const status = await getRateLimitStatus(ip);
          res.json({ success: true, data: status });
        } catch (error) {
          res.status(500).json({
            success: false,
            message: "Failed to get rate limit status",
          });
        }
      }
    );

    // Health check
    this.router.get("/health", (req: Request, res: Response) => {
      res.json({
        success: true,
        message: "Admin tools server is running",
        environment: appConfig.NODE_ENV,
        timestamp: new Date().toISOString(),
      });
    });

    // Fix orders without payment records
    this.router.post(
      "/fix-orders-payments",
      async (req: Request, res: Response) => {
        try {
          // Find orders without payment records
          const ordersWithoutPayments = await prisma.order.findMany({
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

          console.log(
            `Found ${ordersWithoutPayments.length} orders without payment records`
          );

          const fixedPayments = [];

          for (const order of ordersWithoutPayments) {
            try {
              const payment = await prisma.payment.create({
                data: {
                  orderId: order.id,
                  method: "WHATSAPP_MANUAL",
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
            } catch (error) {
              console.error(
                `❌ Failed to create payment for order ${order.id}:`,
                error
              );
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
        } catch (error) {
          console.error("Error fixing orders:", error);
          res.status(500).json({
            success: false,
            message: "Failed to fix orders",
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
