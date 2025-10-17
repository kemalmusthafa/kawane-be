import prisma from "../../prisma";
import { getDashboardStatsService } from "../dashboard/get-dashboard-stats.service";

interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in seconds
  maxSize: number; // Maximum cache entries
}

class DashboardCacheService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private config: CacheConfig = {
    enabled: process.env.CACHE_ENABLED === "true",
    ttl: parseInt(process.env.CACHE_TTL_DASHBOARD || "300"), // 5 minutes default
    maxSize: parseInt(process.env.CACHE_MAX_SIZE || "50"), // ✅ Limit cache size
  };

  /**
   * Get dashboard stats with caching
   */
  async getDashboardStats(params: any = {}) {
    const cacheKey = this.generateCacheKey(params);

    // ✅ Check cache first if enabled
    if (this.config.enabled) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log("📦 Dashboard stats served from cache");
        return cached;
      }
    }

    // ✅ Fetch from database
    console.log("🔄 Fetching dashboard stats from database");
    const stats = await getDashboardStatsService(params);

    // ✅ Store in cache if enabled
    if (this.config.enabled) {
      this.setCache(cacheKey, stats);
    }

    return stats;
  }

  /**
   * Invalidate dashboard cache
   */
  invalidateCache() {
    if (this.config.enabled) {
      this.cache.clear();
      console.log("🗑️ Dashboard cache invalidated");
    }
  }

  /**
   * Invalidate specific cache key
   */
  invalidateCacheKey(params: any = {}) {
    if (this.config.enabled) {
      const cacheKey = this.generateCacheKey(params);
      this.cache.delete(cacheKey);
      console.log(`🗑️ Dashboard cache invalidated for key: ${cacheKey}`);
    }
  }

  /**
   * Generate cache key from parameters
   */
  private generateCacheKey(params: any): string {
    const { startDate, endDate } = params;
    return `dashboard:stats:${startDate || "all"}:${endDate || "all"}`;
  }

  /**
   * Get data from cache
   */
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    const isExpired = now - cached.timestamp > this.config.ttl * 1000;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Set data in cache with size limit
   */
  private setCache(key: string, data: any): void {
    // ✅ Auto-cleanup when cache is full (Limit-friendly)
    if (this.cache.size >= this.config.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
        console.log(`🧹 Cache full, removed oldest entry: ${firstKey}`);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      enabled: this.config.enabled,
      ttl: this.config.ttl,
      maxSize: this.config.maxSize,
      currentSize: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredEntries() {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, value] of this.cache.entries()) {
      const isExpired = now - value.timestamp > this.config.ttl * 1000;
      if (isExpired) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach((key) => this.cache.delete(key));

    if (expiredKeys.length > 0) {
      console.log(`🧹 Cleared ${expiredKeys.length} expired cache entries`);
    }
  }
}

// ✅ Singleton instance
export const dashboardCacheService = new DashboardCacheService();

// ✅ Auto-cleanup expired entries every 5 minutes (Limit-friendly)
if (process.env.CACHE_ENABLED === "true") {
  setInterval(() => {
    dashboardCacheService.clearExpiredEntries();
  }, 5 * 60 * 1000); // 5 minutes
}
