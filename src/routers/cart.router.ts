import { Router } from "express";
import { CartController } from "../controllers/cart.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import {
  validateBody,
  validateParams,
} from "../middlewares/zod-validation.middleware";
import {
  addToCartSchema,
  addDealToCartSchema,
  updateCartItemSchema,
  cartItemIdParamSchema,
} from "../utils/validation-schemas";

export class CartRouter {
  private router: Router;
  private cartController: CartController;

  constructor() {
    this.router = Router();
    this.cartController = new CartController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // 🛒 CART MANAGEMENT ENDPOINTS

    // Add item to cart
    this.router.post(
      "/add",
      requireAuth,
      validateBody(addToCartSchema),
      this.cartController.addToCartController
    );

    // Add deal product to cart with discount
    this.router.post(
      "/add-deal",
      requireAuth,
      validateBody(addDealToCartSchema),
      this.cartController.addDealToCartController
    );

    // Get user's cart
    this.router.get("/", requireAuth, this.cartController.getCartController);

    // Update cart item quantity
    this.router.put(
      "/items/:cartItemId",
      requireAuth,
      validateParams(cartItemIdParamSchema),
      validateBody(updateCartItemSchema),
      this.cartController.updateCartItemController
    );

    // Remove item from cart
    this.router.delete(
      "/items/:cartItemId",
      requireAuth,
      validateParams(cartItemIdParamSchema),
      this.cartController.removeFromCartController
    );

    // Clear entire cart
    this.router.delete(
      "/",
      requireAuth,
      this.cartController.clearCartController
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
