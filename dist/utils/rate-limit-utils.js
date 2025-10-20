"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetRateLimits = exports.getRateLimitStatus = exports.clearAllRateLimits = exports.clearRateLimit = void 0;
// utils/rate-limit-utils.ts
const ioredis_1 = require("ioredis");
const config_1 = require("./config");
// Redis client untuk rate limit management
const redis = new ioredis_1.Redis(config_1.appConfig.REDIS_URL, {
    password: config_1.appConfig.REDIS_PASSWORD,
    db: config_1.appConfig.REDIS_DB,
});
/**
 * Clear rate limit untuk IP tertentu
 */
const clearRateLimit = async (ip) => {
    try {
        const keys = await redis.keys(`*:${ip}`);
        if (keys.length > 0) {
            await redis.del(...keys);
            console.log(`Cleared rate limit for IP: ${ip}`);
        }
    }
    catch (error) {
        console.error("Error clearing rate limit:", error);
    }
};
exports.clearRateLimit = clearRateLimit;
/**
 * Clear semua rate limit (untuk development)
 */
const clearAllRateLimits = async () => {
    try {
        const keys = await redis.keys("*rate-limit*");
        if (keys.length > 0) {
            await redis.del(...keys);
            console.log(`Cleared ${keys.length} rate limit entries`);
        }
    }
    catch (error) {
        console.error("Error clearing all rate limits:", error);
    }
};
exports.clearAllRateLimits = clearAllRateLimits;
/**
 * Get rate limit status untuk IP tertentu
 */
const getRateLimitStatus = async (ip) => {
    try {
        const keys = await redis.keys(`*:${ip}`);
        const status = [];
        for (const key of keys) {
            const ttl = await redis.ttl(key);
            const count = await redis.get(key);
            status.push({
                key,
                count: count || 0,
                ttl: ttl > 0 ? ttl : "expired",
            });
        }
        return status;
    }
    catch (error) {
        console.error("Error getting rate limit status:", error);
        return [];
    }
};
exports.getRateLimitStatus = getRateLimitStatus;
/**
 * Development helper: Reset rate limits
 */
const resetRateLimits = async () => {
    if (config_1.appConfig.NODE_ENV === "development") {
        await (0, exports.clearAllRateLimits)();
        console.log("Rate limits reset for development");
    }
};
exports.resetRateLimits = resetRateLimits;
