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
exports.rateLimitInfo = exports.createCustomRateLimit = exports.emailRateLimit = exports.paymentRateLimit = exports.orderRateLimit = exports.uploadRateLimit = exports.searchRateLimit = exports.apiRateLimit = exports.strictRateLimit = exports.authRateLimit = exports.generalRateLimit = void 0;
const express_rate_limit_1 = __importStar(require("express-rate-limit"));
const config_1 = require("../utils/config");
// ========================================
// 🚦 RATE LIMITING MIDDLEWARE
// ========================================
/**
 * Custom message untuk rate limit exceeded
 */
const rateLimitMessage = (req, res) => {
    return res.status(429).json({
        success: false,
        message: "Too many requests, please try again later",
        retryAfter: Math.round(req.rateLimit?.resetTime
            ? (req.rateLimit.resetTime - Date.now()) / 1000
            : 60),
    });
};
/**
 * Custom key generator untuk rate limiting
 */
const keyGenerator = (req) => {
    // Untuk authenticated users, gunakan user ID sebagai key
    if (req.user?.id) {
        return `user:${req.user.id}`;
    }
    // Gunakan ipKeyGenerator helper untuk IPv6 compatibility
    return (0, express_rate_limit_1.ipKeyGenerator)(req.ip || req.connection.remoteAddress || "unknown");
};
// ========================================
// 🌐 GENERAL RATE LIMITING
// ========================================
/**
 * General rate limiting untuk semua endpoints
 */
exports.generalRateLimit = (0, express_rate_limit_1.default)({
    windowMs: config_1.appConfig.RATE_LIMIT_WINDOW_MS, // 15 minutes
    max: config_1.appConfig.NODE_ENV === "development"
        ? 10000
        : config_1.appConfig.RATE_LIMIT_MAX_REQUESTS, // Very high limit in development
    message: rateLimitMessage,
    keyGenerator,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: rateLimitMessage,
    // Skip rate limiting in development
    skip: (req) => config_1.appConfig.NODE_ENV === "development",
});
// ========================================
// 🔐 AUTHENTICATION RATE LIMITING
// ========================================
/**
 * Strict rate limiting untuk authentication endpoints
 */
exports.authRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: config_1.appConfig.NODE_ENV === "development"
        ? 10000
        : config_1.appConfig.RATE_LIMIT_AUTH_MAX, // Very high limit in development
    message: rateLimitMessage,
    keyGenerator,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitMessage,
    skipSuccessfulRequests: true, // Don't count successful requests
    // Use memory store for development to avoid Redis issues
    store: config_1.appConfig.NODE_ENV === "development" ? undefined : undefined,
    // Skip rate limiting in development
    skip: (req) => config_1.appConfig.NODE_ENV === "development",
});
// ========================================
// 📝 STRICT RATE LIMITING
// ========================================
/**
 * Very strict rate limiting untuk sensitive operations
 */
exports.strictRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: config_1.appConfig.NODE_ENV === "development" ? 1000 : 3, // Very high limit in development
    message: rateLimitMessage,
    keyGenerator,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitMessage,
    skipSuccessfulRequests: true,
    // Skip rate limiting in development
    skip: (req) => config_1.appConfig.NODE_ENV === "development",
});
// ========================================
// 📊 API RATE LIMITING
// ========================================
/**
 * Moderate rate limiting untuk API endpoints
 */
exports.apiRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: config_1.appConfig.NODE_ENV === "development" ? 10000 : 200, // Very high limit in development
    message: rateLimitMessage,
    keyGenerator,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitMessage,
    // Skip rate limiting in development
    skip: (req) => config_1.appConfig.NODE_ENV === "development",
});
// ========================================
// 🔍 SEARCH RATE LIMITING
// ========================================
/**
 * Rate limiting untuk search endpoints
 */
exports.searchRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: config_1.appConfig.NODE_ENV === "development" ? 1000 : 30, // Very high limit in development
    message: rateLimitMessage,
    keyGenerator,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitMessage,
    // Skip rate limiting in development
    skip: (req) => config_1.appConfig.NODE_ENV === "development",
});
// ========================================
// 📤 UPLOAD RATE LIMITING
// ========================================
/**
 * Rate limiting untuk file upload endpoints
 */
exports.uploadRateLimit = (0, express_rate_limit_1.default)({
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
exports.orderRateLimit = (0, express_rate_limit_1.default)({
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
exports.paymentRateLimit = (0, express_rate_limit_1.default)({
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
exports.emailRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 emails per hour
    message: rateLimitMessage,
    keyGenerator,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitMessage,
    // Skip rate limiting in development
    skip: (req) => config_1.appConfig.NODE_ENV === "development",
});
// ========================================
// 🎯 CUSTOM RATE LIMITING
// ========================================
/**
 * Create custom rate limiter
 */
const createCustomRateLimit = (windowMs, max, message) => {
    return (0, express_rate_limit_1.default)({
        windowMs,
        max,
        message: message
            ? (req, res) => {
                return res.status(429).json({
                    success: false,
                    message,
                    retryAfter: Math.round(req.rateLimit?.resetTime
                        ? (req.rateLimit.resetTime - Date.now()) / 1000
                        : 60),
                });
            }
            : rateLimitMessage,
        keyGenerator,
        standardHeaders: true,
        legacyHeaders: false,
        handler: rateLimitMessage,
    });
};
exports.createCustomRateLimit = createCustomRateLimit;
// ========================================
// 🔧 RATE LIMIT INFO MIDDLEWARE
// ========================================
/**
 * Middleware untuk menambahkan rate limit info ke response headers
 */
const rateLimitInfo = (req, res, next) => {
    if (req.rateLimit) {
        res.set({
            "X-RateLimit-Limit": req.rateLimit.limit.toString(),
            "X-RateLimit-Remaining": req.rateLimit.remaining.toString(),
            "X-RateLimit-Reset": new Date(req.rateLimit.resetTime).toISOString(),
        });
    }
    next();
};
exports.rateLimitInfo = rateLimitInfo;
