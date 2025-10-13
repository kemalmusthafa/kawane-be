"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderRouter = void 0;
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const zod_validation_middleware_1 = require("../middlewares/zod-validation.middleware");
const validation_schemas_1 = require("../utils/validation-schemas");
class OrderRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.orderController = new order_controller_1.OrderController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Get user orders with pagination
        this.router.get("/", auth_middleware_1.requireAuth, (0, zod_validation_middleware_1.validateQuery)(validation_schemas_1.orderQuerySchema), this.orderController.getUserOrdersController);
        // Create new order
        this.router.post("/", auth_middleware_1.requireAuth, (0, zod_validation_middleware_1.validateBody)(validation_schemas_1.createOrderSchema), this.orderController.createOrderController);
        // Get order detail by ID
        this.router.get("/:orderId", auth_middleware_1.requireAuth, (0, zod_validation_middleware_1.validateParams)(validation_schemas_1.orderIdParamSchema), this.orderController.getOrderDetailController);
        // Update order status (Staff/Admin only)
        this.router.put("/:orderId/status", auth_middleware_1.requireAuth, auth_middleware_1.requireStaff, (0, zod_validation_middleware_1.validateParams)(validation_schemas_1.orderIdParamSchema), (0, zod_validation_middleware_1.validateBody)(validation_schemas_1.updateOrderStatusSchema), this.orderController.updateOrderStatusController);
        // Cancel order (Customer only)
        this.router.put("/:orderId/cancel", auth_middleware_1.requireAuth, (0, zod_validation_middleware_1.validateParams)(validation_schemas_1.orderIdParamSchema), this.orderController.cancelOrderController);
    }
    getRouter() {
        return this.router;
    }
}
exports.OrderRouter = OrderRouter;
