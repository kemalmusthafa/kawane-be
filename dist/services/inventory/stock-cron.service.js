"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockCronService = void 0;
const stock_monitoring_service_1 = require("./stock-monitoring.service");
// Cron job untuk auto monitoring stock
class StockCronService {
    // Start cron job untuk monitoring stock setiap 1 jam
    static startStockMonitoring() {
        if (this.isRunning) {
            console.log("⚠️ Stock monitoring cron is already running");
            return;
        }
        this.isRunning = true;
        console.log("🚀 Starting automatic stock monitoring...");
        // Run pertama kali saat startup
        this.runStockMonitoring();
        // Set interval untuk run setiap 1 jam (3600000 ms)
        setInterval(() => {
            this.runStockMonitoring();
        }, 3600000); // 1 jam
        console.log("⏰ Stock monitoring scheduled every 1 hour");
    }
    // Stop cron job
    static stopStockMonitoring() {
        this.isRunning = false;
        console.log("🛑 Stock monitoring cron stopped");
    }
    // Run stock monitoring
    static async runStockMonitoring() {
        try {
            console.log("📦 Running automatic stock monitoring...");
            const startTime = Date.now();
            const result = await stock_monitoring_service_1.StockMonitoringService.monitorAllProducts();
            const endTime = Date.now();
            const duration = endTime - startTime;
            console.log(`✅ Stock monitoring completed in ${duration}ms`);
            console.log(`📊 Products monitored: ${result.productsMonitored}`);
            console.log(`🔔 Notifications created: ${result.notificationsCreated}`);
            if (result.notificationsCreated > 0) {
                console.log(`🚨 Stock alerts sent to staff/admin`);
            }
        }
        catch (error) {
            console.error("❌ Automatic stock monitoring failed:", error);
        }
    }
    // Manual trigger untuk testing
    static async manualTrigger() {
        console.log("🔧 Manual stock monitoring triggered");
        await this.runStockMonitoring();
    }
}
exports.StockCronService = StockCronService;
StockCronService.isRunning = false;
