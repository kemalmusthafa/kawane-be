import { Router } from "express";
import { WishlistController } from "../controllers/wishlist.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validateBody } from "../middlewares/zod-validation.middleware";
import { toggleWishlistSchema } from "../utils/validation-schemas";

export class WishlistRouter {
  private router: Router;
  private wishlistController: WishlistController;

  constructor() {
    this.router = Router();
    this.wishlistController = new WishlistController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get user's wishlist
    this.router.get(
      "/",
      requireAuth,
      this.wishlistController.getWishlistController
    );

    // Toggle wishlist item
    this.router.post(
      "/toggle",
      requireAuth,
      validateBody(toggleWishlistSchema),
      this.wishlistController.toggleWishlistController
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
