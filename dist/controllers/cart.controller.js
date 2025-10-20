"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartController = void 0;
const add_to_cart_service_1 = require("../services/cart/add-to-cart.service");
const add_deal_to_cart_service_1 = require("../services/cart/add-deal-to-cart.service");
const update_cart_item_service_1 = require("../services/cart/update-cart-item.service");
const remove_from_cart_service_1 = require("../services/cart/remove-from-cart.service");
const clear_cart_service_1 = require("../services/cart/clear-cart.service");
const get_cart_service_1 = require("../services/cart/get-cart.service");
class CartController {
    // Get user's cart
    async getCartController(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const result = await (0, get_cart_service_1.getCartService)({ userId });
            res.json({
                success: true,
                message: "Cart retrieved successfully",
                data: result,
            });
        }
        catch (error) {
            console.error("Get cart error:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Failed to get cart",
            });
        }
    }
    // Add item to cart
    async addToCartController(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const { productId, quantity, size } = req.body;
            const result = await (0, add_to_cart_service_1.addToCartService)({
                userId,
                productId,
                quantity,
                size,
            });
            res.json({
                success: true,
                message: result.message,
                data: { cartItem: result.cartItem },
            });
        }
        catch (error) {
            console.error("Add to cart error:", error);
            res.status(400).json({
                success: false,
                message: error.message || "Failed to add item to cart",
            });
        }
    }
    // Add deal product to cart with discount
    async addDealToCartController(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const { dealId, productId, quantity } = req.body;
            const result = await (0, add_deal_to_cart_service_1.addDealToCartService)({
                userId,
                dealId,
                productId,
                quantity,
            });
            res.json({
                success: true,
                message: result.message,
                data: {
                    cartItem: result.cartItem,
                    dealInfo: result.dealInfo,
                },
            });
        }
        catch (error) {
            console.error("Add deal to cart error:", error);
            res.status(400).json({
                success: false,
                message: error.message || "Failed to add deal item to cart",
            });
        }
    }
    // Update cart item quantity
    async updateCartItemController(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const { cartItemId } = req.params;
            const { quantity } = req.body;
            const result = await (0, update_cart_item_service_1.updateCartItemService)({
                userId,
                cartItemId,
                quantity,
            });
            res.json({
                success: true,
                message: result.message,
                data: { cartItem: result.cartItem },
            });
        }
        catch (error) {
            console.error("Update cart item error:", error);
            res.status(400).json({
                success: false,
                message: error.message || "Failed to update cart item",
            });
        }
    }
    // Remove item from cart
    async removeFromCartController(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const { cartItemId } = req.params;
            const result = await (0, remove_from_cart_service_1.removeFromCartService)({
                userId,
                cartItemId,
            });
            res.json({
                success: true,
                message: result.message,
            });
        }
        catch (error) {
            console.error("Remove from cart error:", error);
            res.status(400).json({
                success: false,
                message: error.message || "Failed to remove item from cart",
            });
        }
    }
    // Clear entire cart
    async clearCartController(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const result = await (0, clear_cart_service_1.clearCartService)({ userId });
            res.json({
                success: true,
                message: result.message,
            });
        }
        catch (error) {
            console.error("Clear cart error:", error);
            res.status(400).json({
                success: false,
                message: error.message || "Failed to clear cart",
            });
        }
    }
}
exports.CartController = CartController;
