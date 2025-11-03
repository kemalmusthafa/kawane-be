"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BannerController = void 0;
const async_handler_middleware_1 = require("../middlewares/async-handler.middleware");
class BannerController {
    async createBanner(req, res) {
        return (0, async_handler_middleware_1.errorResponse)(res, "Banner feature has been removed", 404);
    }
    async getBanners(req, res) {
        return (0, async_handler_middleware_1.successResponse)(res, [], "Banners feature removed");
    }
    async updateBanner(req, res) {
        return (0, async_handler_middleware_1.errorResponse)(res, "Banner feature has been removed", 404);
    }
    async deleteBanner(req, res) {
        return (0, async_handler_middleware_1.errorResponse)(res, "Banner feature has been removed", 404);
    }
}
exports.BannerController = BannerController;
