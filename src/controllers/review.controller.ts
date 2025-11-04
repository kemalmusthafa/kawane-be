import { Request, Response } from "express";
import { createReviewService } from "../services/review/create-review.service";
import {
  successResponse,
  errorResponse,
} from "../middlewares/async-handler.middleware";
import prisma from "../prisma";

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export class ReviewController {
  async getReviewsController(req: Request, res: Response) {
    try {
      const productId = req.query.productId as string;
      
      if (!productId) {
        return errorResponse(res, "Product ID is required", 400);
      }

      const reviews = await prisma.review.findMany({
        where: { productId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      successResponse(res, reviews, "Reviews retrieved successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async createReviewController(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      const review = await createReviewService({
        userId,
        ...req.body,
      });

      successResponse(res, review, "Review submitted successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }
}
