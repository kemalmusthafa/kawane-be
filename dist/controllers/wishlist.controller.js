"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistController = void 0;
const toggle_wishlist_service_1 = require("../services/wishlist/toggle-wishlist.service");
const get_wishlist_service_1 = require("../services/wishlist/get-wishlist.service");
const async_handler_middleware_1 = require("../middlewares/async-handler.middleware");
class WishlistController {
    async getWishlistController(req, res) {
        try {
            const userId = req.user.id;
            const result = await (0, get_wishlist_service_1.getWishlistService)({
                userId,
            });
            (0, async_handler_middleware_1.successResponse)(res, result, "Wishlist retrieved successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    async toggleWishlistController(req, res) {
        try {
            const userId = req.user.id;
            const { productId } = req.body;
            const result = await (0, toggle_wishlist_service_1.toggleWishlistService)({
                userId,
                productId,
            });
            (0, async_handler_middleware_1.successResponse)(res, result, "Wishlist updated successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
}
exports.WishlistController = WishlistController;
