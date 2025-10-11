// routers/dev.router.ts
import { Router, Request, Response } from "express";
import {
  clearRateLimit,
  clearAllRateLimits,
  getRateLimitStatus,
} from "../utils/rate-limit-utils";
import { appConfig } from "../utils/config";
import prisma from "../prisma";
import { DevController } from "./dev.controller";

export class DevRouter {
  private router: Router;
  private devController: DevController;

  constructor() {
    this.router = Router();
    this.devController = new DevController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Only enable in development
    if (appConfig.NODE_ENV === "development") {
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
          message: "Development server is running",
          environment: appConfig.NODE_ENV,
          timestamp: new Date().toISOString(),
        });
      });

      // Test forgot password (returns reset link directly)
      this.router.post(
        "/test-forgot-password",
        this.devController.testForgotPassword.bind(this.devController)
      );

      // Create payment record for testing
      this.router.post(
        "/create-payment",
        async (req: Request, res: Response) => {
          try {
            const {
              orderId,
              method = "MIDTRANS",
              amount,
              status = "PENDING",
            } = req.body;

            if (!orderId || !amount) {
              return res.status(400).json({
                success: false,
                message: "orderId and amount are required",
              });
            }

            // Check if order exists
            const order = await prisma.order.findUnique({
              where: { id: orderId },
            });

            if (!order) {
              return res.status(404).json({
                success: false,
                message: "Order not found",
              });
            }

            // Check if payment already exists
            const existingPayment = await prisma.payment.findFirst({
              where: { orderId },
            });

            if (existingPayment) {
              return res.status(400).json({
                success: false,
                message: "Payment already exists for this order",
                data: existingPayment,
              });
            }

            // Create payment record
            const payment = await prisma.payment.create({
              data: {
                orderId,
                method,
                amount,
                status,
              },
            });

            res.json({
              success: true,
              message: "Payment record created successfully",
              data: payment,
            });
          } catch (error) {
            console.error("Error creating payment record:", error);
            res.status(500).json({
              success: false,
              message: "Failed to create payment record",
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }
      );

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
  }

  getRouter(): Router {
    return this.router;
  }
}
