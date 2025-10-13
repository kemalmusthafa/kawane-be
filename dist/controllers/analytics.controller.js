"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const analytics_service_1 = require("../services/analytics/analytics.service");
const async_handler_middleware_1 = require("../middlewares/async-handler.middleware");
class AnalyticsController {
    constructor() {
        this.getAnalyticsController = (0, async_handler_middleware_1.asyncHandler)(async (req, res) => {
            const { period = "30" } = req.query;
            const analytics = await this.analyticsService.getAnalytics(parseInt(period));
            res.status(200).json({
                success: true,
                message: "Analytics data retrieved successfully",
                data: analytics,
            });
        });
        this.analyticsService = new analytics_service_1.AnalyticsService();
    }
}
exports.AnalyticsController = AnalyticsController;
