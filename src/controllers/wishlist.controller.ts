import { Request, Response } from "express";
import { toggleWishlistService } from "../services/wishlist/toggle-wishlist.service";
import { getWishlistService } from "../services/wishlist/get-wishlist.service";
import {
  successResponse,
  errorResponse,
} from "../middlewares/async-handler.middleware";

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export class WishlistController {
  async getWishlistController(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      const result = await getWishlistService({
        userId,
      });

      successResponse(res, result, "Wishlist retrieved successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async toggleWishlistController(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { productId } = req.body;

      const result = await toggleWishlistService({
        userId,
        productId,
      });

      successResponse(res, result, "Wishlist updated successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }
}
