// utils/rate-limit-utils.ts
import { Redis } from "ioredis";
import { appConfig } from "./config";

// Redis client untuk rate limit management
const redis = new Redis(appConfig.REDIS_URL, {
  password: appConfig.REDIS_PASSWORD,
  db: appConfig.REDIS_DB,
});

/**
 * Clear rate limit untuk IP tertentu
 */
export const clearRateLimit = async (ip: string) => {
  try {
    const keys = await redis.keys(`*:${ip}`);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`Cleared rate limit for IP: ${ip}`);
    }
  } catch (error) {
    console.error("Error clearing rate limit:", error);
  }
};

/**
 * Clear semua rate limit (untuk development)
 */
export const clearAllRateLimits = async () => {
  try {
    const keys = await redis.keys("*rate-limit*");
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`Cleared ${keys.length} rate limit entries`);
    }
  } catch (error) {
    console.error("Error clearing all rate limits:", error);
  }
};

/**
 * Get rate limit status untuk IP tertentu
 */
export const getRateLimitStatus = async (ip: string) => {
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
  } catch (error) {
    console.error("Error getting rate limit status:", error);
    return [];
  }
};

/**
 * Development helper: Reset rate limits
 */
export const resetRateLimits = async () => {
  if (appConfig.NODE_ENV === "development") {
    await clearAllRateLimits();
    console.log("Rate limits reset for development");
  }
};
