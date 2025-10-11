import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { Request, Response } from "express";
import { appConfig } from "../utils/config";

// Extend Request interface untuk rate limiting
interface RateLimitRequest extends Request {
  rateLimit?: {
    limit: number;
    remaining: number;
    resetTime: number;
  };
  user?: {
    id: string;
    role: string;
  };
}

// ========================================
// 🚦 RATE LIMITING MIDDLEWARE
// ========================================

/**
 * Custom message untuk rate limit exceeded
 */
const rateLimitMessage = (req: RateLimitRequest, res: Response) => {
  return res.status(429).json({
    success: false,
    message: "Too many requests, please try again later",
    retryAfter: Math.round(
      req.rateLimit?.resetTime
        ? (req.rateLimit.resetTime - Date.now()) / 1000
        : 60
    ),
  });
};

/**
 * Custom key generator untuk rate limiting
 */
const keyGenerator = (req: RateLimitRequest): string => {
  // Untuk authenticated users, gunakan user ID sebagai key
  if (req.user?.id) {
    return `user:${req.user.id}`;
  }

  // Gunakan ipKeyGenerator helper untuk IPv6 compatibility
  return ipKeyGenerator(req.ip || req.connection.remoteAddress || "unknown");
};

// ========================================
// 🌐 GENERAL RATE LIMITING
// ========================================

/**
 * General rate limiting untuk semua endpoints
 */
export const generalRateLimit = rateLimit({
  windowMs: appConfig.RATE_LIMIT_WINDOW_MS, // 15 minutes
  max:
    appConfig.NODE_ENV === "development"
      ? 10000
      : appConfig.RATE_LIMIT_MAX_REQUESTS, // Very high limit in development
  message: rateLimitMessage,
  keyGenerator,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: rateLimitMessage,
  // Skip rate limiting in development
  skip: (req) => appConfig.NODE_ENV === "development",
});

// ========================================
// 🔐 AUTHENTICATION RATE LIMITING
// ========================================

/**
 * Strict rate limiting untuk authentication endpoints
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:
    appConfig.NODE_ENV === "development"
      ? 10000
      : appConfig.RATE_LIMIT_AUTH_MAX, // Very high limit in development
  message: rateLimitMessage,
  keyGenerator,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitMessage,
  skipSuccessfulRequests: true, // Don't count successful requests
  // Use memory store for development to avoid Redis issues
  store: appConfig.NODE_ENV === "development" ? undefined : undefined,
  // Skip rate limiting in development
  skip: (req) => appConfig.NODE_ENV === "development",
});

// ========================================
// 📝 STRICT RATE LIMITING
// ========================================

/**
 * Very strict rate limiting untuk sensitive operations
 */
export const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: appConfig.NODE_ENV === "development" ? 1000 : 3, // Very high limit in development
  message: rateLimitMessage,
  keyGenerator,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitMessage,
  skipSuccessfulRequests: true,
  // Skip rate limiting in development
  skip: (req) => appConfig.NODE_ENV === "development",
});

// ========================================
// 📊 API RATE LIMITING
// ========================================

/**
 * Moderate rate limiting untuk API endpoints
 */
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: appConfig.NODE_ENV === "development" ? 10000 : 200, // Very high limit in development
  message: rateLimitMessage,
  keyGenerator,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitMessage,
  // Skip rate limiting in development
  skip: (req) => appConfig.NODE_ENV === "development",
});

// ========================================
// 🔍 SEARCH RATE LIMITING
// ========================================

/**
 * Rate limiting untuk search endpoints
 */
export const searchRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: appConfig.NODE_ENV === "development" ? 1000 : 30, // Very high limit in development
  message: rateLimitMessage,
  keyGenerator,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitMessage,
  // Skip rate limiting in development
  skip: (req) => appConfig.NODE_ENV === "development",
});

// ========================================
// 📤 UPLOAD RATE LIMITING
// ========================================

/**
 * Rate limiting untuk file upload endpoints
 */
export const uploadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 uploads per window
  message: rateLimitMessage,
  keyGenerator,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitMessage,
});

// ========================================
// 🛒 ORDER RATE LIMITING
// ========================================

/**
 * Rate limiting untuk order creation
 */
export const orderRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // 5 orders per 5 minutes
  message: rateLimitMessage,
  keyGenerator,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitMessage,
});

// ========================================
// 💳 PAYMENT RATE LIMITING
// ========================================

/**
 * Rate limiting untuk payment endpoints
 */
export const paymentRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // 10 payment attempts per window
  message: rateLimitMessage,
  keyGenerator,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitMessage,
});

// ========================================
// 📧 EMAIL RATE LIMITING
// ========================================

/**
 * Rate limiting untuk email sending (verification, reset password)
 */
export const emailRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 emails per hour
  message: rateLimitMessage,
  keyGenerator,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitMessage,
  // Skip rate limiting in development
  skip: (req) => appConfig.NODE_ENV === "development",
});

// ========================================
// 🎯 CUSTOM RATE LIMITING
// ========================================

/**
 * Create custom rate limiter
 */
export const createCustomRateLimit = (
  windowMs: number,
  max: number,
  message?: string
) => {
  return rateLimit({
    windowMs,
    max,
    message: message
      ? (req: RateLimitRequest, res: Response) => {
          return res.status(429).json({
            success: false,
            message,
            retryAfter: Math.round(
              req.rateLimit?.resetTime
                ? (req.rateLimit.resetTime - Date.now()) / 1000
                : 60
            ),
          });
        }
      : rateLimitMessage,
    keyGenerator,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitMessage,
  });
};

// ========================================
// 🔧 RATE LIMIT INFO MIDDLEWARE
// ========================================

/**
 * Middleware untuk menambahkan rate limit info ke response headers
 */
export const rateLimitInfo = (
  req: RateLimitRequest,
  res: Response,
  next: any
) => {
  if (req.rateLimit) {
    res.set({
      "X-RateLimit-Limit": req.rateLimit.limit.toString(),
      "X-RateLimit-Remaining": req.rateLimit.remaining.toString(),
      "X-RateLimit-Reset": new Date(req.rateLimit.resetTime).toISOString(),
    });
  }
  next();
};
