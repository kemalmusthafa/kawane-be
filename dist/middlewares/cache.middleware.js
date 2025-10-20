"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.veryLongCache = exports.longCache = exports.mediumCache = exports.shortCache = exports.cacheWithTTL = exports.cacheInventoryLogs = exports.cacheOrders = exports.cacheDashboardStats = exports.cacheUser = exports.cacheUsers = exports.cacheProduct = exports.cacheProducts = exports.invalidateCache = exports.cacheWithKey = exports.cacheMiddleware = void 0;
const redis_service_1 = __importDefault(require("../services/cache/redis.service"));
// ========================================
// 🗄️ CACHE MIDDLEWARE
// ========================================
/**
 * Cache middleware untuk GET requests
 */
const cacheMiddleware = (ttlSeconds = 3600) => {
    return async (req, res, next) => {
        // Only cache GET requests
        if (req.method !== "GET") {
            return next();
        }
        try {
            // Generate cache key berdasarkan route dan query parameters
            const cacheKey = generateCacheKey(req);
            // Check if data exists in cache
            const cachedData = await redis_service_1.default.get(cacheKey);
            if (cachedData) {
                console.log(`🗄️ Cache HIT for key: ${cacheKey}`);
                return res.status(200).json(cachedData);
            }
            console.log(`🗄️ Cache MISS for key: ${cacheKey}`);
            // Store original res.json method
            const originalJson = res.json;
            // Override res.json to cache the response
            res.json = function (data) {
                // Cache the response data
                redis_service_1.default.set(cacheKey, data, ttlSeconds).catch((error) => {
                    console.error("Failed to cache response:", error);
                });
                // Call original json method
                return originalJson.call(this, data);
            };
            next();
        }
        catch (error) {
            console.error("Cache middleware error:", error);
            next(); // Continue without caching if there's an error
        }
    };
};
exports.cacheMiddleware = cacheMiddleware;
/**
 * Cache middleware untuk specific cache keys
 */
const cacheWithKey = (keyGenerator, ttlSeconds = 3600) => {
    return async (req, res, next) => {
        if (req.method !== "GET") {
            return next();
        }
        try {
            const cacheKey = keyGenerator(req);
            const cachedData = await redis_service_1.default.get(cacheKey);
            if (cachedData) {
                console.log(`🗄️ Cache HIT for key: ${cacheKey}`);
                return res.status(200).json(cachedData);
            }
            console.log(`🗄️ Cache MISS for key: ${cacheKey}`);
            const originalJson = res.json;
            res.json = function (data) {
                redis_service_1.default.set(cacheKey, data, ttlSeconds).catch((error) => {
                    console.error("Failed to cache response:", error);
                });
                return originalJson.call(this, data);
            };
            next();
        }
        catch (error) {
            console.error("Cache middleware error:", error);
            next();
        }
    };
};
exports.cacheWithKey = cacheWithKey;
/**
 * Cache invalidation middleware
 */
const invalidateCache = (keyPatterns) => {
    return async (req, res, next) => {
        // Only invalidate on non-GET requests
        if (req.method === "GET") {
            return next();
        }
        try {
            // Invalidate cache patterns
            for (const pattern of keyPatterns) {
                await redis_service_1.default.delPattern(pattern);
                console.log(`🗄️ Cache invalidated for pattern: ${pattern}`);
            }
            next();
        }
        catch (error) {
            console.error("Cache invalidation error:", error);
            next();
        }
    };
};
exports.invalidateCache = invalidateCache;
/**
 * Cache middleware untuk products
 */
exports.cacheProducts = (0, exports.cacheWithKey)((req) => {
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
}, 1800 // 30 minutes
);
/**
 * Cache middleware untuk single product
 */
exports.cacheProduct = (0, exports.cacheWithKey)((req) => `product:${req.params.productId}`, 3600 // 1 hour
);
/**
 * Cache middleware untuk users
 */
exports.cacheUsers = (0, exports.cacheWithKey)((req) => {
    const params = {
        search: req.query.search,
        role: req.query.role,
        page: req.query.page,
        limit: req.query.limit,
    };
    return `users:list:${JSON.stringify(params)}`;
}, 1800 // 30 minutes
);
/**
 * Cache middleware untuk single user
 */
exports.cacheUser = (0, exports.cacheWithKey)((req) => `user:${req.params.id}`, 3600 // 1 hour
);
/**
 * Cache middleware untuk dashboard stats
 */
exports.cacheDashboardStats = (0, exports.cacheWithKey)((req) => {
    const userId = req.user?.id;
    return userId ? `dashboard:stats:${userId}` : `dashboard:stats:global`;
}, 300 // 5 minutes
);
/**
 * Cache middleware untuk orders
 */
exports.cacheOrders = (0, exports.cacheWithKey)((req) => {
    const userId = req.user?.id;
    const params = {
        status: req.query.status,
        page: req.query.page,
        limit: req.query.limit,
    };
    return `orders:${userId}:${JSON.stringify(params)}`;
}, 600 // 10 minutes
);
/**
 * Cache middleware untuk inventory logs
 */
exports.cacheInventoryLogs = (0, exports.cacheWithKey)((req) => {
    const params = {
        productId: req.query.productId,
        page: req.query.page,
        limit: req.query.limit,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
    };
    return `inventory:logs:${JSON.stringify(params)}`;
}, 300 // 5 minutes
);
// ========================================
// 🔧 HELPER FUNCTIONS
// ========================================
/**
 * Generate cache key dari request
 */
function generateCacheKey(req) {
    const baseKey = `${req.method}:${req.originalUrl}`;
    const queryString = JSON.stringify(req.query);
    return `${baseKey}:${Buffer.from(queryString).toString("base64")}`;
}
/**
 * Cache middleware untuk specific TTL
 */
const cacheWithTTL = (ttlSeconds) => {
    return (0, exports.cacheMiddleware)(ttlSeconds);
};
exports.cacheWithTTL = cacheWithTTL;
/**
 * Short cache (5 minutes)
 */
exports.shortCache = (0, exports.cacheWithTTL)(300);
/**
 * Medium cache (30 minutes)
 */
exports.mediumCache = (0, exports.cacheWithTTL)(1800);
/**
 * Long cache (1 hour)
 */
exports.longCache = (0, exports.cacheWithTTL)(3600);
/**
 * Very long cache (24 hours)
 */
exports.veryLongCache = (0, exports.cacheWithTTL)(86400);
