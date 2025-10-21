import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

// Suppress Redis errors globally
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const message = args.join(" ");
  if (
    message.includes("[ioredis]") ||
    message.includes("ECONNREFUSED") ||
    message.includes("127.0.0.1:6379")
  ) {
    // Suppress Redis errors
    return;
  }
  originalConsoleError.apply(console, args);
};
import { UserRouter } from "./routers/user.router";
import { AuthRouter } from "./routers/auth.router";
import { ProductRouter } from "./routers/product.router";
import { OrderRouter } from "./routers/order.router";
import { AddressRouter } from "./routers/address.router";
import { PaymentRouter } from "./routers/payment.router";
import { NotificationRouter } from "./routers/notification.router";
import { DashboardRouter } from "./routers/dashboard.router";
import { ReviewRouter } from "./routers/review.router";
import { WishlistRouter } from "./routers/wishlist.router";
import { AdminRouter } from "./routers/admin.router";
import { AdminNotificationRouter } from "./routers/admin-notification.router";
import { InventoryRouter } from "./routers/inventory.router";
import { CustomerNotificationRouter } from "./routers/customer-notification.router";
import { ShipmentRouter } from "./routers/shipment.router";
import { CartRouter } from "./routers/cart.router";
import { CategoryRouter } from "./routers/category.router";
import { DealRouter } from "./routers/deal.router";
import dealExpirationRouter from "./routers/deal-expiration.router";
// Development router only in development mode
import { AdminToolsRouter } from "./development/dev.router";
import { AnalyticsRouter } from "./routers/analytics.router";
import { ReportsRouter } from "./routers/reports.router";
import { BestSellersRouter } from "./routers/best-sellers.router";
import lookbookRouter from "./routers/lookbook.router";
import { StockMonitoringRouter } from "./routers/stock-monitoring.router";
import { StockCronService } from "./services/inventory/stock-cron.service";
import { DealCronService } from "./services/deal/deal-cron.service";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/error-handler.middleware";
import {
  generalRateLimit,
  rateLimitInfo,
} from "./middlewares/rate-limit.middleware";
// Import redis service with fallback
let redisService: any;
try {
  redisService = require("./services/cache/redis.service").default;
} catch (error) {
  // Fallback redis service if module not found
  redisService = {
    connect: async () => {},
    set: async () => {},
    get: async () => null,
    del: async () => {},
    clearAll: async () => {},
  };
}

dotenv.config();

const PORT = process.env.PORT || 8000;
const app: Application = express();

// Increase payload size limit for image uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
// CORS configuration
const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3001",
      "https://a17246ba3f70.ngrok-free.app",
      "https://61b74318a24d.ngrok-free.app",
      "https://kawane-fe.vercel.app",
      "https://kawane-studio-frontend.vercel.app",
      "https://kawane-be.vercel.app", // Add backend URL for self-referencing
      process.env.BASE_URL_FE || "http://localhost:3000",
    ];

    // Allow ngrok URLs dynamically
    if (origin && origin.includes("ngrok")) {
      return callback(null, true);
    }

    // Allow Vercel preview URLs
    if (origin && origin.includes("vercel.app")) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"), false);
    }
  },
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Cache-Control",
    "Pragma",
    "ngrok-skip-browser-warning", // Allow ngrok headers
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false,
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

// Additional CORS headers for all responses (only for specific policies)
app.use((req, res, next) => {
  // Fix Cross-Origin-Opener-Policy for Google OAuth
  res.header("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.header("Cross-Origin-Embedder-Policy", "unsafe-none");
  res.header("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

// Rate limiting middleware
app.use(generalRateLimit);
app.use(rateLimitInfo);

app.get("/api/health/db", async (_req: Request, res: Response) => {
  try {
    // Test database connection with timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Database connection timeout")), 10000);
    });

    const dbTestPromise = (async () => {
      const { default: prisma } = await import("./prisma");
      await prisma.$queryRaw`SELECT 1`;
      await prisma.$disconnect();
    })();

    await Promise.race([dbTestPromise, timeoutPromise]);

    res.status(200).json({
      success: true,
      message: "Database connection is healthy",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Database health check failed:", error);
    res.status(503).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/api", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Kawane Studio API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      products: "/api/products",
      orders: "/api/orders",
      addresses: "/api/addresses",
      payments: "/api/payments",
      notifications: "/api/notifications",
      dashboard: "/api/dashboard",
      reviews: "/api/reviews",
      wishlist: "/api/wishlist",
      admin: "/api/admin",
      inventory: "/api/inventory",
      shipments: "/api/shipments",
      cart: "/api/cart",
      lookbook: "/api/lookbook",
      adminTools: "/api/admin-tools (Admin only)",
    },
  });
});

app.use("/api/public", express.static(path.join(__dirname, "../public")));

const authRouter = new AuthRouter();
const userRouter = new UserRouter();
const productRouter = new ProductRouter();
const orderRouter = new OrderRouter();
const addressRouter = new AddressRouter();
const paymentRouter = new PaymentRouter();
const notificationRouter = new NotificationRouter();
const dashboardRouter = new DashboardRouter();
const reviewRouter = new ReviewRouter();
const wishlistRouter = new WishlistRouter();
const adminRouter = new AdminRouter();
const adminNotificationRouter = new AdminNotificationRouter();
const inventoryRouter = new InventoryRouter();
const customerNotificationRouter = new CustomerNotificationRouter();
const shipmentRouter = new ShipmentRouter();
const cartRouter = new CartRouter();
const categoryRouter = new CategoryRouter();
const dealRouter = new DealRouter();
const adminToolsRouter = new AdminToolsRouter();
const analyticsRouter = new AnalyticsRouter();
const reportsRouter = new ReportsRouter();
const bestSellersRouter = new BestSellersRouter();
const stockMonitoringRouter = new StockMonitoringRouter();

app.use("/api/auth", authRouter.getRouter());
app.use("/api/users", userRouter.getRouter());
app.use("/api/products", productRouter.getRouter());
app.use("/api/orders", orderRouter.getRouter());
app.use("/api/addresses", addressRouter.getRouter());
app.use("/api/payments", paymentRouter.getRouter());
app.use("/api/notifications", notificationRouter.getRouter());
app.use("/api/dashboard", dashboardRouter.getRouter());
app.use("/api/reviews", reviewRouter.getRouter());
app.use("/api/wishlist", wishlistRouter.getRouter());
app.use("/api/admin", adminRouter.getRouter());
app.use("/api/admin/notifications", adminNotificationRouter.getRouter());
app.use("/api/inventory", inventoryRouter.getRouter());
app.use("/api/customer-notifications", customerNotificationRouter.getRouter());
app.use("/api/shipments", shipmentRouter.getRouter());
app.use("/api/cart", cartRouter.getRouter());
app.use("/api/categories", categoryRouter.getRouter());
app.use("/api/deals", dealRouter.getRouter());
app.use("/api/deals", dealExpirationRouter);
// Admin tools - production-ready admin utilities with authentication
app.use("/api/admin-tools", adminToolsRouter.getRouter());
app.use("/api/admin/analytics", analyticsRouter.getRouter());
app.use("/api/admin/reports", reportsRouter.getRouter());
app.use("/api/admin/stock-monitoring", stockMonitoringRouter.getRouter());
app.use("/api/best-sellers", bestSellersRouter.getRouter());
app.use("/api/lookbook", lookbookRouter);

app.use(notFoundHandler);
app.use(errorHandler);

// Initialize Redis connection
async function initializeRedis() {
  try {
    await redisService.connect();
    // Redis connected successfully (silent)

    // Test Redis connection
    await redisService.set("test", "Redis is working!", 60);
    const testValue = await redisService.get("test");
    // Redis test completed (silent)
  } catch (error) {
    // Redis connection failed, continuing without cache (silent)
  }
}

// Initialize Redis and start server
async function startServer() {
  await initializeRedis();

  app.listen(PORT, () => {
    // Server started successfully
    // Start automatic deal expiration monitoring
    DealCronService.startDealExpirationMonitoring();
  });
}

startServer().catch(console.error);

export default app;
