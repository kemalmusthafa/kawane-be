"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BannerController = void 0;
const create_banner_service_1 = require("../services/banner/create-banner.service");
const update_banner_service_1 = require("../services/banner/update-banner.service");
const delete_banner_service_1 = require("../services/banner/delete-banner.service");
const get_banners_service_1 = require("../services/banner/get-banners.service");
const async_handler_middleware_1 = require("../middlewares/async-handler.middleware");
class BannerController {
    // Get all banners (Public for active, Admin for all)
    async getBannersController(req, res) {
        try {
            const { isActive, includeInactive } = req.query;
            // If user is admin/staff, allow seeing all banners
            const authReq = req;
            const includeAll = authReq.user &&
                (authReq.user.role === "ADMIN" || authReq.user.role === "STAFF");
            const result = await (0, get_banners_service_1.getBannersService)({
                isActive: isActive !== undefined ? isActive === "true" : undefined,
                includeInactive: includeAll ? includeInactive === "true" : false,
            });
            (0, async_handler_middleware_1.successResponse)(res, result, "Banners retrieved successfully");
        }
        catch (error) {
            console.error("Get banners error:", error);
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
    // Create banner (Admin only)
    async createBannerController(req, res) {
        try {
            // Check if user is admin
            if (!req.user || req.user.role !== "ADMIN") {
                return (0, async_handler_middleware_1.errorResponse)(res, "Unauthorized. Admin access required", 403);
            }
            const { text, isActive, backgroundColor, textColor, linkUrl, linkText, dealId, priority, duration, } = req.body;
            const newBanner = await (0, create_banner_service_1.createBannerService)({
                text,
                isActive,
                backgroundColor,
                textColor,
                linkUrl,
                linkText,
                dealId,
                priority,
                duration,
            });
            (0, async_handler_middleware_1.successResponse)(res, newBanner, "Banner created successfully");
        }
        catch (error) {
            console.error("Create banner error:", error);
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    // Update banner (Admin only)
    async updateBannerController(req, res) {
        try {
            const { bannerId } = req.params;
            // Check if user is admin
            if (!req.user || req.user.role !== "ADMIN") {
                return (0, async_handler_middleware_1.errorResponse)(res, "Unauthorized. Admin access required", 403);
            }
            const { text, isActive, backgroundColor, textColor, linkUrl, linkText, dealId, priority, duration, } = req.body;
            const updatedBanner = await (0, update_banner_service_1.updateBannerService)(bannerId, {
                text,
                isActive,
                backgroundColor,
                textColor,
                linkUrl,
                linkText,
                dealId,
                priority,
                duration,
            });
            (0, async_handler_middleware_1.successResponse)(res, updatedBanner, "Banner updated successfully");
        }
        catch (error) {
            console.error("Update banner error:", error);
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    // Delete banner (Admin only)
    async deleteBannerController(req, res) {
        try {
            const { bannerId } = req.params;
            // Check if user is admin
            if (!req.user || req.user.role !== "ADMIN") {
                return (0, async_handler_middleware_1.errorResponse)(res, "Unauthorized. Admin access required", 403);
            }
            const result = await (0, delete_banner_service_1.deleteBannerService)(bannerId);
            (0, async_handler_middleware_1.successResponse)(res, result, "Banner deleted successfully");
        }
        catch (error) {
            console.error("Delete banner error:", error);
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
}
exports.BannerController = BannerController;
