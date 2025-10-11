import { Request, Response } from "express";
import { SettingsService } from "../services/settings/settings.service";
import { asyncHandler } from "../middlewares/async-handler.middleware";

export class SettingsController {
  private settingsService: SettingsService;

  constructor() {
    this.settingsService = new SettingsService();
  }

  public getSettingsController = asyncHandler(
    async (req: Request, res: Response) => {
      const settings = await this.settingsService.getSettings();

      res.status(200).json({
        success: true,
        message: "Settings retrieved successfully",
        data: settings,
      });
    }
  );

  public updateSettingsController = asyncHandler(
    async (req: Request, res: Response) => {
      const settingsData = req.body;

      const updatedSettings = await this.settingsService.updateSettings(
        settingsData
      );

      res.status(200).json({
        success: true,
        message: "Settings updated successfully",
        data: updatedSettings,
      });
    }
  );
}
