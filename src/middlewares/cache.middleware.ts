import { Request, Response, NextFunction } from "express";
import redisService from "../services/cache/redis.service";

// ========================================
// 🗄️ CACHE MIDDLEWARE
// ========================================

/**
 * Cache middleware untuk GET requests
 */
export const cacheMiddleware = (ttlSeconds: number = 3600) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    try {
      // Generate cache key berdasarkan route dan query parameters
      const cacheKey = generateCacheKey(req);

      // Check if data exists in cache
      const cachedData = await redisService.get(cacheKey);

      if (cachedData) {
        console.log(`🗄️ Cache HIT for key: ${cacheKey}`);
        return res.status(200).json(cachedData);
      }

      console.log(`🗄️ Cache MISS for key: ${cacheKey}`);

      // Store original res.json method
      const originalJson = res.json;

      // Override res.json to cache the response
      res.json = function (data: any) {
        // Cache the response data
        redisService.set(cacheKey, data, ttlSeconds).catch((error: any) => {
          console.error("Failed to cache response:", error);
        });

        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error("Cache middleware error:", error);
      next(); // Continue without caching if there's an error
    }
  };
};

/**
 * Cache middleware untuk specific cache keys
 */
export const cacheWithKey = (
  keyGenerator: (req: Request) => string,
  ttlSeconds: number = 3600
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "GET") {
      return next();
    }

    try {
      const cacheKey = keyGenerator(req);
      const cachedData = await redisService.get(cacheKey);

      if (cachedData) {
        console.log(`🗄️ Cache HIT for key: ${cacheKey}`);
        return res.status(200).json(cachedData);
      }

      console.log(`🗄️ Cache MISS for key: ${cacheKey}`);

      const originalJson = res.json;

      res.json = function (data: any) {
        redisService.set(cacheKey, data, ttlSeconds).catch((error: any) => {
          console.error("Failed to cache response:", error);
        });

        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error("Cache middleware error:", error);
      next();
    }
  };
};

/**
 * Cache invalidation middleware
 */
export const invalidateCache = (keyPatterns: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only invalidate on non-GET requests
    if (req.method === "GET") {
      return next();
    }

    try {
      // Invalidate cache patterns
      for (const pattern of keyPatterns) {
        await redisService.delPattern(pattern);
        console.log(`🗄️ Cache invalidated for pattern: ${pattern}`);
      }

      next();
    } catch (error) {
      console.error("Cache invalidation error:", error);
      next();
    }
  };
};

/**
 * Cache middleware untuk products
 */
export const cacheProducts = cacheWithKey(
  (req: Request) => {
    const params = {
      search: req.query.search,
      categoryId: req.query.categoryId,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      inStock: req.query.inStock,
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    };
    return `products:list:${JSON.stringify(params)}`;
  },
  1800 // 30 minutes
);

/**
 * Cache middleware untuk single product
 */
export const cacheProduct = cacheWithKey(
  (req: Request) => `product:${req.params.productId}`,
  3600 // 1 hour
);

/**
 * Cache middleware untuk users
 */
export const cacheUsers = cacheWithKey(
  (req: Request) => {
    const params = {
      search: req.query.search,
      role: req.query.role,
      page: req.query.page,
      limit: req.query.limit,
    };
    return `users:list:${JSON.stringify(params)}`;
  },
  1800 // 30 minutes
);

/**
 * Cache middleware untuk single user
 */
export const cacheUser = cacheWithKey(
  (req: Request) => `user:${req.params.id}`,
  3600 // 1 hour
);

/**
 * Cache middleware untuk dashboard stats
 */
export const cacheDashboardStats = cacheWithKey(
  (req: Request) => {
    const userId = (req as any).user?.id;
    return userId ? `dashboard:stats:${userId}` : `dashboard:stats:global`;
  },
  300 // 5 minutes
);

/**
 * Cache middleware untuk orders
 */
export const cacheOrders = cacheWithKey(
  (req: Request) => {
    const userId = (req as any).user?.id;
    const params = {
      status: req.query.status,
      page: req.query.page,
      limit: req.query.limit,
    };
    return `orders:${userId}:${JSON.stringify(params)}`;
  },
  600 // 10 minutes
);

/**
 * Cache middleware untuk inventory logs
 */
export const cacheInventoryLogs = cacheWithKey(
  (req: Request) => {
    const params = {
      productId: req.query.productId,
      page: req.query.page,
      limit: req.query.limit,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };
    return `inventory:logs:${JSON.stringify(params)}`;
  },
  300 // 5 minutes
);

// ========================================
// 🔧 HELPER FUNCTIONS
// ========================================

/**
 * Generate cache key dari request
 */
function generateCacheKey(req: Request): string {
  const baseKey = `${req.method}:${req.originalUrl}`;
  const queryString = JSON.stringify(req.query);
  return `${baseKey}:${Buffer.from(queryString).toString("base64")}`;
}

/**
 * Cache middleware untuk specific TTL
 */
export const cacheWithTTL = (ttlSeconds: number) => {
  return cacheMiddleware(ttlSeconds);
};

/**
 * Short cache (5 minutes)
 */
export const shortCache = cacheWithTTL(300);

/**
 * Medium cache (30 minutes)
 */
export const mediumCache = cacheWithTTL(1800);

/**
 * Long cache (1 hour)
 */
export const longCache = cacheWithTTL(3600);

/**
 * Very long cache (24 hours)
 */
export const veryLongCache = cacheWithTTL(86400);
