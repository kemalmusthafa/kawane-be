"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsController = void 0;
const settings_service_1 = require("../services/settings/settings.service");
const async_handler_middleware_1 = require("../middlewares/async-handler.middleware");
class SettingsController {
    constructor() {
        this.getSettingsController = (0, async_handler_middleware_1.asyncHandler)(async (req, res) => {
            const settings = await this.settingsService.getSettings();
            res.status(200).json({
                success: true,
                message: "Settings retrieved successfully",
                data: settings,
            });
        });
        this.updateSettingsController = (0, async_handler_middleware_1.asyncHandler)(async (req, res) => {
            const settingsData = req.body;
            const updatedSettings = await this.settingsService.updateSettings(settingsData);
            res.status(200).json({
                success: true,
                message: "Settings updated successfully",
                data: updatedSettings,
            });
        });
        this.settingsService = new settings_service_1.SettingsService();
    }
}
exports.SettingsController = SettingsController;
