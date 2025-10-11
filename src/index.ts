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
import { InventoryRouter } from "./routers/inventory.router";
import { CustomerNotificationRouter } from "./routers/customer-notification.router";
import { ShipmentRouter } from "./routers/shipment.router";
import { CartRouter } from "./routers/cart.router";
import { CategoryRouter } from "./routers/category.router";
import { DealRouter } from "./routers/deal.router";
import dealExpirationRouter from "./routers/deal-expiration.router";
import { DevRouter } from "./development/dev.router";
import { AnalyticsRouter } from "./routers/analytics.router";
import { ReportsRouter } from "./routers/reports.router";
import { SettingsRouter } from "./routers/settings.router";
import lookbookRouter from "./routers/lookbook.router";
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
import redisService from "./services/cache/redis.service";

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
      process.env.BASE_URL_FE || "http://localhost:3000",
    ];

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
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false,
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

// Rate limiting middleware
app.use(generalRateLimit);
app.use(rateLimitInfo);

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
const inventoryRouter = new InventoryRouter();
const customerNotificationRouter = new CustomerNotificationRouter();
const shipmentRouter = new ShipmentRouter();
const cartRouter = new CartRouter();
const categoryRouter = new CategoryRouter();
const dealRouter = new DealRouter();
const devRouter = new DevRouter();
const analyticsRouter = new AnalyticsRouter();
const reportsRouter = new ReportsRouter();
const settingsRouter = new SettingsRouter();

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
app.use("/api/inventory", inventoryRouter.getRouter());
app.use("/api/customer-notifications", customerNotificationRouter.getRouter());
app.use("/api/shipments", shipmentRouter.getRouter());
app.use("/api/cart", cartRouter.getRouter());
app.use("/api/categories", categoryRouter.getRouter());
app.use("/api/deals", dealRouter.getRouter());
app.use("/api/deals", dealExpirationRouter);
app.use("/api/dev", devRouter.getRouter());
app.use("/api/admin/analytics", analyticsRouter.getRouter());
app.use("/api/admin/reports", reportsRouter.getRouter());
app.use("/api/admin/settings", settingsRouter.getRouter());
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
    console.log(`🚀 Server is running on http://localhost:${PORT}/api`);
    console.log(
      `📚 API Documentation available at http://localhost:${PORT}/api`
    );
    // Redis Status: Connected/Disconnected (silent)

    // 🚀 Start automatic stock monitoring (temporarily disabled)
    // StockCronService.startStockMonitoring();

    // 🚀 Start automatic deal expiration monitoring
    DealCronService.startDealExpirationMonitoring();
  });
}

startServer().catch(console.error);

export default app;
