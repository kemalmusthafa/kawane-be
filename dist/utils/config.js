"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Helper function untuk validate required environment variables
const requireEnv = (name) => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`❌ Environment variable ${name} is required but not set!`);
    }
    return value;
};
// Validate environment variables saat startup
exports.appConfig = {
    // JWT Configuration
    JWT_SECRET: requireEnv("JWT_SECRET"),
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "120m",
    // Database Configuration
    DATABASE_URL: requireEnv("DATABASE_URL"),
    DIRECT_URL: process.env.DIRECT_URL || requireEnv("DATABASE_URL"),
    // Server Configuration
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: parseInt(process.env.PORT || "8000"),
    // CORS Configuration
    CORS_ORIGIN: process.env.BASE_URL_FE || "http://localhost:3000",
    // Email Configuration
    MAIL_USER: process.env.MAIL_USER,
    MAIL_PASS: process.env.MAIL_PASS,
    // Cloudinary Configuration
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    // Google OAuth
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    // Midtrans Configuration
    MIDTRANS_SERVER_KEY: process.env.MIDTRANS_SERVER_KEY,
    MIDTRANS_CLIENT_KEY: process.env.MIDTRANS_CLIENT_KEY,
    MIDTRANS_IS_PRODUCTION: process.env.MIDTRANS_IS_PRODUCTION === "true",
    // Redis Configuration
    REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    REDIS_DB: parseInt(process.env.REDIS_DB || "0"),
    // Rate Limiting Configuration
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
    RATE_LIMIT_AUTH_MAX: parseInt(process.env.RATE_LIMIT_AUTH_MAX || "10"), // 10 login attempts per window
    // Email Rate Limiting Configuration
    EMAIL_RATE_LIMIT_WINDOW_MS: parseInt(process.env.EMAIL_RATE_LIMIT_WINDOW_MS || "86400000"), // 24 hours (1 day)
    EMAIL_RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.EMAIL_RATE_LIMIT_MAX_REQUESTS || "10"), // 10 emails per day
    EMAIL_RATE_LIMIT_WINDOW_MS_HOURLY: parseInt(process.env.EMAIL_RATE_LIMIT_WINDOW_MS_HOURLY || "3600000"), // 1 hour
    EMAIL_RATE_LIMIT_MAX_REQUESTS_HOURLY: parseInt(process.env.EMAIL_RATE_LIMIT_MAX_REQUESTS_HOURLY || "5"), // 5 emails per hour
    // Auth Rate Limiting Configuration
    AUTH_RATE_LIMIT_WINDOW_MS: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
    AUTH_RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || "20"), // 20 auth attempts per window
    // API Rate Limiting Configuration
    API_RATE_LIMIT_WINDOW_MS: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
    API_RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.API_RATE_LIMIT_MAX_REQUESTS || "200"), // 200 API calls per window
    // Search Rate Limiting Configuration
    SEARCH_RATE_LIMIT_WINDOW_MS: parseInt(process.env.SEARCH_RATE_LIMIT_WINDOW_MS || "60000"), // 1 minute
    SEARCH_RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.SEARCH_RATE_LIMIT_MAX_REQUESTS || "30"), // 30 searches per minute
};
// Validate critical configs
if (exports.appConfig.JWT_SECRET.length < 32) {
    throw new Error("❌ JWT_SECRET must be at least 32 characters long for security!");
}
// Environment configuration loaded successfully
