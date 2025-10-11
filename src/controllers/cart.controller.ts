import { Request, Response } from "express";
import { addToCartService } from "../services/cart/add-to-cart.service";
import { addDealToCartService } from "../services/cart/add-deal-to-cart.service";
import { updateCartItemService } from "../services/cart/update-cart-item.service";
import { removeFromCartService } from "../services/cart/remove-from-cart.service";
import { clearCartService } from "../services/cart/clear-cart.service";
import { getCartService } from "../services/cart/get-cart.service";
import { AuthRequest } from "../middlewares/auth.middleware";

export class CartController {
  // Get user's cart
  async getCartController(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const result = await getCartService({ userId });
      res.json({
        success: true,
        message: "Cart retrieved successfully",
        data: result,
      });
    } catch (error: any) {
      console.error("Get cart error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to get cart",
      });
    }
  }

  // Add item to cart
  async addToCartController(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const { productId, quantity } = req.body;

      const result = await addToCartService({
        userId,
        productId,
        quantity,
      });

      res.json({
        success: true,
        message: result.message,
        data: { cartItem: result.cartItem },
      });
    } catch (error: any) {
      console.error("Add to cart error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to add item to cart",
      });
    }
  }

  // Add deal product to cart with discount
  async addDealToCartController(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const { dealId, productId, quantity } = req.body;

      const result = await addDealToCartService({
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
    } catch (error: any) {
      console.error("Add deal to cart error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to add deal item to cart",
      });
    }
  }

  // Update cart item quantity
  async updateCartItemController(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const { cartItemId } = req.params;
      const { quantity } = req.body;

      const result = await updateCartItemService({
        userId,
        cartItemId,
        quantity,
      });

      res.json({
        success: true,
        message: result.message,
        data: { cartItem: result.cartItem },
      });
    } catch (error: any) {
      console.error("Update cart item error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to update cart item",
      });
    }
  }

  // Remove item from cart
  async removeFromCartController(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const { cartItemId } = req.params;

      const result = await removeFromCartService({
        userId,
        cartItemId,
      });

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      console.error("Remove from cart error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to remove item from cart",
      });
    }
  }

  // Clear entire cart
  async clearCartController(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const result = await clearCartService({ userId });

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      console.error("Clear cart error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to clear cart",
      });
    }
  }
}
