// Banner feature removed - router disabled
import { Router } from "express";
import { BannerController } from "../controllers/banner.controller";

export class BannerRouter {
  private router: Router;
  private bannerController: BannerController;

  constructor() {
    this.router = Router();
    this.bannerController = new BannerController();
    this.setupRoutes();
  }

  private setupRoutes() {
    // All routes disabled - Banner feature removed
  }

  public getRouter(): Router {
    return this.router;
  }
}
