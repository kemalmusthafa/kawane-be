import cron, { ScheduledTask } from "node-cron";
import {
  expireDealsService,
  cleanupExpiredDealsService,
} from "./deal-expiration.service";

export class DealCronService {
  private static isRunning = false;
  private static cronJobs: ScheduledTask[] = [];

  static startDealExpirationMonitoring() {
    if (this.isRunning) {
      console.log("Deal expiration monitoring is already running");
      return;
    }

    console.log("🚀 Starting deal expiration monitoring...");

    // Run every 5 minutes to check for expired deals (more frequent)
    const expireJob = cron.schedule("*/5 * * * *", async () => {
      try {
        console.log("🕐 Running deal expiration check...");
        const result = await expireDealsService();

        if (result.expiredDealsCount > 0) {
          console.log(`✅ Expired ${result.expiredDealsCount} deals`);
        } else {
          console.log("ℹ️ No expired deals found");
        }
      } catch (error) {
        console.error("❌ Error in deal expiration cron job:", error);
      }
    });

    // Run daily at 2 AM to cleanup old expired deals
    const cleanupJob = cron.schedule("0 2 * * *", async () => {
      try {
        console.log("🧹 Running deal cleanup...");
        const result = await cleanupExpiredDealsService();

        if (result.cleanedUpDealsCount > 0) {
          console.log(
            `✅ Cleaned up ${result.cleanedUpDealsCount} old expired deals`
          );
        } else {
          console.log("ℹ️ No old expired deals to cleanup");
        }
      } catch (error) {
        console.error("❌ Error in deal cleanup cron job:", error);
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
