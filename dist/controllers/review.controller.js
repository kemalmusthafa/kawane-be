"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const create_review_service_1 = require("../services/review/create-review.service");
const async_handler_middleware_1 = require("../middlewares/async-handler.middleware");
class ReviewController {
    async createReviewController(req, res) {
        try {
            const userId = req.user.id;
            const review = await (0, create_review_service_1.createReviewService)({
                userId,
                ...req.body,
            });
            (0, async_handler_middleware_1.successResponse)(res, review, "Review submitted successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
}
exports.ReviewController = ReviewController;
