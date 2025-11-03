"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BannerRouter = void 0;
// Banner feature removed - router disabled
const express_1 = require("express");
const banner_controller_1 = require("../controllers/banner.controller");
class BannerRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.bannerController = new banner_controller_1.BannerController();
        this.setupRoutes();
    }
    setupRoutes() {
        // All routes disabled - Banner feature removed
    }
    getRouter() {
        return this.router;
    }
}
exports.BannerRouter = BannerRouter;
