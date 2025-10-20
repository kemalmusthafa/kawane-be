"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DealCronService = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const deal_expiration_service_1 = require("./deal-expiration.service");
class DealCronService {
    static startDealExpirationMonitoring() {
        if (this.isRunning) {
            console.log("Deal expiration monitoring is already running");
            return;
        }
        console.log("🚀 Starting deal expiration monitoring...");
        // Run every 5 minutes to check for expired deals (more frequent)
        const expireJob = node_cron_1.default.schedule("*/5 * * * *", async () => {
            try {
                console.log("🕐 Running deal expiration check...");
                // Add timeout to prevent hanging connections
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error("Deal expiration check timeout")), 30000); // 30 seconds timeout
                });
                const result = (await Promise.race([
                    (0, deal_expiration_service_1.expireDealsService)(),
                    timeoutPromise,
                ]));
                if (result.expiredDealsCount > 0) {
                    console.log(`✅ Expired ${result.expiredDealsCount} deals`);
                }
                else {
                    console.log("ℹ️ No expired deals found");
                }
            }
            catch (error) {
                console.error("❌ Error in deal expiration cron job:", error);
                // Don't throw error to prevent cron job from stopping
            }
        });
        // Run daily at 2 AM to cleanup old expired deals
        const cleanupJob = node_cron_1.default.schedule("0 2 * * *", async () => {
            try {
                console.log("🧹 Running deal cleanup...");
                // Add timeout to prevent hanging connections
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error("Deal cleanup timeout")), 60000); // 60 seconds timeout
                });
                const result = (await Promise.race([
                    (0, deal_expiration_service_1.cleanupExpiredDealsService)(),
                    timeoutPromise,
                ]));
                if (result.cleanedUpDealsCount > 0) {
                    console.log(`✅ Cleaned up ${result.cleanedUpDealsCount} old expired deals`);
                }
                else {
                    console.log("ℹ️ No old expired deals to cleanup");
                }
            }
            catch (error) {
                console.error("❌ Error in deal cleanup cron job:", error);
                // Don't throw error to prevent cron job from stopping
            }
        });
        this.cronJobs.push(expireJob, cleanupJob);
        this.isRunning = true;
        console.log("✅ Deal expiration monitoring started successfully");
    }
    static stopDealExpirationMonitoring() {
        if (!this.isRunning) {
            console.log("Deal expiration monitoring is not running");
            return;
        }
        this.cronJobs.forEach((job) => job.destroy());
        this.cronJobs = [];
        this.isRunning = false;
        console.log("🛑 Deal expiration monitoring stopped");
    }
    static getStatus() {
        return {
            isRunning: this.isRunning,
            description: "Deal expiration and cleanup monitoring",
        };
    }
}
exports.DealCronService = DealCronService;
DealCronService.isRunning = false;
DealCronService.cronJobs = [];
