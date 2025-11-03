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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Suppress Redis errors globally
const originalConsoleError = console.error;
console.error = (...args) => {
    const message = args.join(" ");
    if (message.includes("[ioredis]") ||
        message.includes("ECONNREFUSED") ||
        message.includes("127.0.0.1:6379")) {
        // Suppress Redis errors
        return;
    }
    originalConsoleError.apply(console, args);
};
const user_router_1 = require("./routers/user.router");
const auth_router_1 = require("./routers/auth.router");
const product_router_1 = require("./routers/product.router");
const order_router_1 = require("./routers/order.router");
const address_router_1 = require("./routers/address.router");
const payment_router_1 = require("./routers/payment.router");
const notification_router_1 = require("./routers/notification.router");
const dashboard_router_1 = require("./routers/dashboard.router");
const review_router_1 = require("./routers/review.router");
const wishlist_router_1 = require("./routers/wishlist.router");
const admin_router_1 = require("./routers/admin.router");
const admin_notification_router_1 = require("./routers/admin-notification.router");
const inventory_router_1 = require("./routers/inventory.router");
const customer_notification_router_1 = require("./routers/customer-notification.router");
const shipment_router_1 = require("./routers/shipment.router");
const cart_router_1 = require("./routers/cart.router");
const category_router_1 = require("./routers/category.router");
// import { BannerRouter } from "./routers/banner.router"; // Commented: Banner feature removed
const deal_router_1 = require("./routers/deal.router");
const deal_expiration_router_1 = __importDefault(require("./routers/deal-expiration.router"));
// Development router only in development mode
const dev_router_1 = require("./development/dev.router");
const analytics_router_1 = require("./routers/analytics.router");
const reports_router_1 = require("./routers/reports.router");
const best_sellers_router_1 = require("./routers/best-sellers.router");
const lookbook_router_1 = __importDefault(require("./routers/lookbook.router"));
const stock_monitoring_router_1 = require("./routers/stock-monitoring.router");
const deal_cron_service_1 = require("./services/deal/deal-cron.service");
const error_handler_middleware_1 = require("./middlewares/error-handler.middleware");
const rate_limit_middleware_1 = require("./middlewares/rate-limit.middleware");
// Import redis service with fallback
let redisService;
try {
    redisService = require("./services/cache/redis.service").default;
}
catch (error) {
    // Fallback redis service if module not found
    redisService = {
        connect: async () => { },
        set: async () => { },
        get: async () => null,
        del: async () => { },
        clearAll: async () => { },
    };
}
dotenv_1.default.config();
const PORT = process.env.PORT || 8000;
const app = (0, express_1.default)();
// Increase payload size limit for image uploads
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ limit: "50mb", extended: true }));
// CORS configuration - More permissive for development and production
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        // In development, allow all localhost origins
        if (process.env.NODE_ENV === "development") {
            if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
                return callback(null, true);
            }
        }
        const allowedOrigins = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3001",
            "https://a17246ba3f70.ngrok-free.app",
            "https://61b74318a24d.ngrok-free.app",
            "https://kawane-fe.vercel.app",
            "https://kawane-studio-frontend.vercel.app",
            "https://kawane-be.vercel.app",
            process.env.BASE_URL_FE || "http://localhost:3000",
        ];
        // Allow ngrok URLs dynamically (any ngrok subdomain)
        if (origin && origin.includes("ngrok")) {
            return callback(null, true);
        }
        // Allow Vercel preview URLs (any vercel.app subdomain)
        if (origin && origin.includes("vercel.app")) {
            return callback(null, true);
        }
        // Allow localhost in any port for development
        if (origin &&
            (origin.includes("localhost") || origin.includes("127.0.0.1"))) {
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            console.log(`CORS blocked origin: ${origin}`);
            // In production, be more strict
            if (process.env.NODE_ENV === "production") {
                callback(new Error("Not allowed by CORS"), false);
            }
            else {
                // In development, allow unknown origins
                callback(null, true);
            }
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
        "ngrok-skip-browser-warning",
        "x-ngrok-skip-browser-warning", // Alternative ngrok header
    ],
    credentials: true,
    optionsSuccessStatus: 200,
    preflightContinue: false,
};
app.use((0, cors_1.default)(corsOptions));
// Handle preflight requests
app.options("*", (0, cors_1.default)(corsOptions));
// Fallback CORS middleware for any missed requests
app.use((req, res, next) => {
    const origin = req.headers.origin;
    // If origin is not set by CORS middleware, set it manually
    if (!res.getHeader("Access-Control-Allow-Origin") && origin) {
        res.header("Access-Control-Allow-Origin", origin);
        res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, ngrok-skip-browser-warning, x-ngrok-skip-browser-warning");
        res.header("Access-Control-Allow-Credentials", "true");
    }
    // Fix Cross-Origin-Opener-Policy for Google OAuth
    res.header("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    res.header("Cross-Origin-Embedder-Policy", "unsafe-none");
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    next();
});
// Rate limiting middleware
app.use(rate_limit_middleware_1.generalRateLimit);
app.use(rate_limit_middleware_1.rateLimitInfo);
app.get("/api/health/db", async (_req, res) => {
    try {
        // Test database connection with timeout
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Database connection timeout")), 10000);
        });
        const dbTestPromise = (async () => {
            const { default: prisma } = await Promise.resolve().then(() => __importStar(require("./prisma")));
            await prisma.$queryRaw `SELECT 1`;
            await prisma.$disconnect();
        })();
        await Promise.race([dbTestPromise, timeoutPromise]);
        res.status(200).json({
            success: true,
            message: "Database connection is healthy",
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error("Database health check failed:", error);
        res.status(503).json({
            success: false,
            message: "Database connection failed",
            error: error.message,
            timestamp: new Date().toISOString(),
        });
    }
});
app.get("/api/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is healthy",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
    });
});
app.get("/api", (_req, res) => {
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
app.use("/api/public", express_1.default.static(path_1.default.join(__dirname, "../public")));
const authRouter = new auth_router_1.AuthRouter();
const userRouter = new user_router_1.UserRouter();
const productRouter = new product_router_1.ProductRouter();
const orderRouter = new order_router_1.OrderRouter();
const addressRouter = new address_router_1.AddressRouter();
const paymentRouter = new payment_router_1.PaymentRouter();
const notificationRouter = new notification_router_1.NotificationRouter();
const dashboardRouter = new dashboard_router_1.DashboardRouter();
const reviewRouter = new review_router_1.ReviewRouter();
const wishlistRouter = new wishlist_router_1.WishlistRouter();
const adminRouter = new admin_router_1.AdminRouter();
const adminNotificationRouter = new admin_notification_router_1.AdminNotificationRouter();
const inventoryRouter = new inventory_router_1.InventoryRouter();
const customerNotificationRouter = new customer_notification_router_1.CustomerNotificationRouter();
const shipmentRouter = new shipment_router_1.ShipmentRouter();
const cartRouter = new cart_router_1.CartRouter();
const categoryRouter = new category_router_1.CategoryRouter();
// const bannerRouter = new BannerRouter(); // Commented: Banner feature removed
const dealRouter = new deal_router_1.DealRouter();
const adminToolsRouter = new dev_router_1.AdminToolsRouter();
const analyticsRouter = new analytics_router_1.AnalyticsRouter();
const reportsRouter = new reports_router_1.ReportsRouter();
const bestSellersRouter = new best_sellers_router_1.BestSellersRouter();
const stockMonitoringRouter = new stock_monitoring_router_1.StockMonitoringRouter();
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
// app.use("/api/banners", bannerRouter.getRouter()); // Commented: Banner feature removed
app.use("/api/deals", dealRouter.getRouter());
app.use("/api/deals", deal_expiration_router_1.default);
// Admin tools - production-ready admin utilities with authentication
app.use("/api/admin-tools", adminToolsRouter.getRouter());
app.use("/api/admin/analytics", analyticsRouter.getRouter());
app.use("/api/admin/reports", reportsRouter.getRouter());
app.use("/api/admin/stock-monitoring", stockMonitoringRouter.getRouter());
app.use("/api/best-sellers", bestSellersRouter.getRouter());
app.use("/api/lookbook", lookbook_router_1.default);
app.use(error_handler_middleware_1.notFoundHandler);
app.use(error_handler_middleware_1.errorHandler);
// Initialize Redis connection
async function initializeRedis() {
    try {
        await redisService.connect();
        // Redis connected successfully (silent)
        // Test Redis connection
        await redisService.set("test", "Redis is working!", 60);
        const testValue = await redisService.get("test");
        // Redis test completed (silent)
    }
    catch (error) {
        // Redis connection failed, continuing without cache (silent)
    }
}
// Initialize Redis and start server
async function startServer() {
    await initializeRedis();
    app.listen(PORT, () => {
        // Server started successfully
        // Start automatic deal expiration monitoring
        deal_cron_service_1.DealCronService.startDealExpirationMonitoring();
    });
}
startServer().catch(console.error);
exports.default = app;
