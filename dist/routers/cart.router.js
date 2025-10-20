"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartRouter = void 0;
const express_1 = require("express");
const cart_controller_1 = require("../controllers/cart.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const zod_validation_middleware_1 = require("../middlewares/zod-validation.middleware");
const validation_schemas_1 = require("../utils/validation-schemas");
class CartRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.cartController = new cart_controller_1.CartController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // 🛒 CART MANAGEMENT ENDPOINTS
        // Add item to cart
        this.router.post("/add", auth_middleware_1.requireAuth, (0, zod_validation_middleware_1.validateBody)(validation_schemas_1.addToCartSchema), this.cartController.addToCartController);
        // Add deal product to cart with discount
        this.router.post("/add-deal", auth_middleware_1.requireAuth, (0, zod_validation_middleware_1.validateBody)(validation_schemas_1.addDealToCartSchema), this.cartController.addDealToCartController);
        // Get user's cart
        this.router.get("/", auth_middleware_1.requireAuth, this.cartController.getCartController);
        // Update cart item quantity
        this.router.put("/items/:cartItemId", auth_middleware_1.requireAuth, (0, zod_validation_middleware_1.validateParams)(validation_schemas_1.cartItemIdParamSchema), (0, zod_validation_middleware_1.validateBody)(validation_schemas_1.updateCartItemSchema), this.cartController.updateCartItemController);
        // Remove item from cart
        this.router.delete("/items/:cartItemId", auth_middleware_1.requireAuth, (0, zod_validation_middleware_1.validateParams)(validation_schemas_1.cartItemIdParamSchema), this.cartController.removeFromCartController);
        // Clear entire cart
        this.router.delete("/", auth_middleware_1.requireAuth, this.cartController.clearCartController);
    }
    getRouter() {
        return this.router;
    }
}
exports.CartRouter = CartRouter;
