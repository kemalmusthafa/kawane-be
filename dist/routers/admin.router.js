"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRouter = void 0;
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const order_controller_1 = require("../controllers/order.controller");
const admin_notification_router_1 = require("./admin-notification.router");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const zod_validation_middleware_1 = require("../middlewares/zod-validation.middleware");
const validation_schemas_1 = require("../utils/validation-schemas");
class AdminRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.adminController = new admin_controller_1.AdminController();
        this.orderController = new order_controller_1.OrderController();
        this.adminNotificationRouter = new admin_notification_router_1.AdminNotificationRouter();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Create new admin (Super Admin only)
        this.router.post("/create-admin", auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, (0, zod_validation_middleware_1.validateBody)(validation_schemas_1.createAdminSchema), this.adminController.createAdminController);
        // Create new staff (Admin only)
        this.router.post("/create-staff", auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, (0, zod_validation_middleware_1.validateBody)(validation_schemas_1.createStaffSchema), this.adminController.createStaffController);
        // Get all orders (Admin/Staff only)
        this.router.get("/orders", auth_middleware_1.requireAuth, auth_middleware_1.requireStaff, (0, zod_validation_middleware_1.validateQuery)(validation_schemas_1.orderQuerySchema), this.orderController.getAllOrdersController);
        // Admin notifications routes
        this.router.use("/notifications", this.adminNotificationRouter.getRouter());
    }
    getRouter() {
        return this.router;
    }
}
exports.AdminRouter = AdminRouter;
