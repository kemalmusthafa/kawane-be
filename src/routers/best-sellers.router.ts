import { Router } from "express";
import { BestSellersController } from "../controllers/best-sellers.controller";
import { validateQuery } from "../middlewares/zod-validation.middleware";
import { z } from "zod";

export class BestSellersRouter {
  private router: Router;
  private bestSellersController: BestSellersController;

  constructor() {
    this.router = Router();
    this.bestSellersController = new BestSellersController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get best sellers
    this.router.get(
      "/",
      validateQuery(
        z.object({
          limit: z
            .string()
            .optional()
            .transform((val) => (val ? parseInt(val) : 4)),
          categoryId: z.string().optional(),
          timeRange: z
            .enum(["week", "month", "quarter", "year", "all"])
            .optional(),
        })
      ),
      this.bestSellersController.getBestSellersController
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
