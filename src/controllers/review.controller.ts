import { Request, Response } from "express";
import { createReviewService } from "../services/review/create-review.service";
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

export class ReviewController {
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
