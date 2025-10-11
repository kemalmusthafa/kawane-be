import { Router } from "express";
import { SettingsController } from "../controllers/settings.controller";
import { requireAuth, requireAdmin } from "../middlewares/auth.middleware";
import { validateBody } from "../middlewares/zod-validation.middleware";
import { updateSettingsSchema } from "../utils/validation-schemas";

export class SettingsRouter {
  private router: Router;
  private settingsController: SettingsController;

  constructor() {
    this.router = Router();
    this.settingsController = new SettingsController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get system settings (Admin only)
    this.router.get(
      "/",
      requireAuth,
      requireAdmin,
      this.settingsController.getSettingsController
    );

    // Update system settings (Admin only)
    this.router.put(
      "/",
      requireAuth,
      requireAdmin,
      validateBody(updateSettingsSchema),
      this.settingsController.updateSettingsController
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
