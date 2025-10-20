"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BestSellersController = void 0;
const get_best_sellers_service_1 = require("../services/product/get-best-sellers.service");
const async_handler_middleware_1 = require("../middlewares/async-handler.middleware");
class BestSellersController {
    async getBestSellersController(req, res) {
        try {
            const { limit, categoryId, timeRange } = req.query;
            const params = {
                limit: limit ? parseInt(limit) : 4,
                categoryId: categoryId,
                timeRange: timeRange ||
                    "month",
            };
            const result = await (0, get_best_sellers_service_1.getBestSellersService)(params);
            (0, async_handler_middleware_1.successResponse)(res, result.data, result.message);
        }
        catch (error) {
            console.error("Best sellers error:", error);
            (0, async_handler_middleware_1.errorResponse)(res, error.message || "Internal server error", 500);
        }
    }
}
exports.BestSellersController = BestSellersController;
