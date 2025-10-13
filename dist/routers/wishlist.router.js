"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistRouter = void 0;
const express_1 = require("express");
const wishlist_controller_1 = require("../controllers/wishlist.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const zod_validation_middleware_1 = require("../middlewares/zod-validation.middleware");
const validation_schemas_1 = require("../utils/validation-schemas");
class WishlistRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.wishlistController = new wishlist_controller_1.WishlistController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Get user's wishlist
        this.router.get("/", auth_middleware_1.requireAuth, this.wishlistController.getWishlistController);
        // Toggle wishlist item
        this.router.post("/toggle", auth_middleware_1.requireAuth, (0, zod_validation_middleware_1.validateBody)(validation_schemas_1.toggleWishlistSchema), this.wishlistController.toggleWishlistController);
    }
    getRouter() {
        return this.router;
    }
}
exports.WishlistRouter = WishlistRouter;
