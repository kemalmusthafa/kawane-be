import { Router } from "express";
import { ReviewController } from "../controllers/review.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { validateBody } from "../middlewares/zod-validation.middleware";
import { createReviewSchema } from "../utils/validation-schemas";

export class ReviewRouter {
  private router: Router;
  private reviewController: ReviewController;

  constructor() {
    this.router = Router();
    this.reviewController = new ReviewController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Create new review
    this.router.post(
      "/",
      requireAuth,
      validateBody(createReviewSchema),
      this.reviewController.createReviewController
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
