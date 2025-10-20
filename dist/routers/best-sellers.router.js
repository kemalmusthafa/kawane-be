"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BestSellersRouter = void 0;
const express_1 = require("express");
const best_sellers_controller_1 = require("../controllers/best-sellers.controller");
const zod_validation_middleware_1 = require("../middlewares/zod-validation.middleware");
const zod_1 = require("zod");
class BestSellersRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.bestSellersController = new best_sellers_controller_1.BestSellersController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Get best sellers
        this.router.get("/", (0, zod_validation_middleware_1.validateQuery)(zod_1.z.object({
            limit: zod_1.z
                .string()
                .optional()
                .transform((val) => (val ? parseInt(val) : 4)),
            categoryId: zod_1.z.string().optional(),
            timeRange: zod_1.z
                .enum(["week", "month", "quarter", "year", "all"])
                .optional(),
        })), this.bestSellersController.getBestSellersController);
    }
    getRouter() {
        return this.router;
    }
}
exports.BestSellersRouter = BestSellersRouter;
