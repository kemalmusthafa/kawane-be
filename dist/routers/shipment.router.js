"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShipmentRouter = void 0;
const express_1 = require("express");
const shipment_controller_1 = require("../controllers/shipment.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const zod_validation_middleware_1 = require("../middlewares/zod-validation.middleware");
const validation_schemas_1 = require("../utils/validation-schemas");
class ShipmentRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.shipmentController = new shipment_controller_1.ShipmentController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // 🚚 SHIPMENT MANAGEMENT ENDPOINTS
        // Create shipment (Staff/Admin only)
        this.router.post("/", auth_middleware_1.requireAuth, auth_middleware_1.requireStaff, (0, zod_validation_middleware_1.validateBody)(validation_schemas_1.createShipmentSchema), this.shipmentController.createShipmentController);
        // Get shipments with filtering (Staff/Admin can see all, Customer can see their own)
        this.router.get("/", auth_middleware_1.requireAuth, (0, zod_validation_middleware_1.validateQuery)(validation_schemas_1.shipmentQuerySchema), this.shipmentController.getShipmentsController);
        // Get shipment statistics (Staff/Admin only)
        this.router.get("/stats", auth_middleware_1.requireAuth, auth_middleware_1.requireStaff, (0, zod_validation_middleware_1.validateQuery)(validation_schemas_1.shipmentQuerySchema), this.shipmentController.getShipmentStatsController);
        // Get shipment by ID (Staff/Admin can see all, Customer can see their own)
        this.router.get("/:shipmentId", auth_middleware_1.requireAuth, (0, zod_validation_middleware_1.validateParams)(validation_schemas_1.shipmentIdParamSchema), this.shipmentController.getShipmentByIdController);
        // Update shipment (Staff/Admin only)
        this.router.put("/:shipmentId", auth_middleware_1.requireAuth, auth_middleware_1.requireStaff, (0, zod_validation_middleware_1.validateParams)(validation_schemas_1.shipmentIdParamSchema), (0, zod_validation_middleware_1.validateBody)(validation_schemas_1.updateShipmentSchema), this.shipmentController.updateShipmentController);
        // Delete shipment (Admin only)
        this.router.delete("/:shipmentId", auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, (0, zod_validation_middleware_1.validateParams)(validation_schemas_1.shipmentIdParamSchema), this.shipmentController.deleteShipmentController);
        // 🔍 PUBLIC TRACKING ENDPOINT
        // Get shipment by tracking number (Public - no auth required)
        this.router.get("/track/:trackingNumber", (0, zod_validation_middleware_1.validateParams)(validation_schemas_1.trackingNumberParamSchema), this.shipmentController.getShipmentByTrackingController);
    }
    getRouter() {
        return this.router;
    }
}
exports.ShipmentRouter = ShipmentRouter;
