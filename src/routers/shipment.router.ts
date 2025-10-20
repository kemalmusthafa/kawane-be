import { Router } from "express";
import { ShipmentController } from "../controllers/shipment.controller";
import {
  requireAuth,
  requireStaff,
  requireAdmin,
} from "../middlewares/auth.middleware";
import {
  validateBody,
  validateQuery,
  validateParams,
} from "../middlewares/zod-validation.middleware";
import {
  createShipmentSchema,
  updateShipmentSchema,
  shipmentQuerySchema,
  shipmentIdParamSchema,
  trackingNumberParamSchema,
} from "../utils/validation-schemas";

export class ShipmentRouter {
  private router: Router;
  private shipmentController: ShipmentController;

  constructor() {
    this.router = Router();
    this.shipmentController = new ShipmentController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // 🚚 SHIPMENT MANAGEMENT ENDPOINTS

    // Create shipment (Staff/Admin only)
    this.router.post(
      "/",
      requireAuth,
      requireStaff,
      validateBody(createShipmentSchema),
      this.shipmentController.createShipmentController
    );

    // Get shipments with filtering (Staff/Admin can see all, Customer can see their own)
    this.router.get(
      "/",
      requireAuth,
      validateQuery(shipmentQuerySchema),
      this.shipmentController.getShipmentsController
    );

    // Get shipment statistics (Staff/Admin only)
    this.router.get(
      "/stats",
      requireAuth,
      requireStaff,
      validateQuery(shipmentQuerySchema),
      this.shipmentController.getShipmentStatsController
    );

    // Get shipment by ID (Staff/Admin can see all, Customer can see their own)
    this.router.get(
      "/:shipmentId",
      requireAuth,
      validateParams(shipmentIdParamSchema),
      this.shipmentController.getShipmentByIdController
    );

    // Update shipment (Staff/Admin only)
    this.router.put(
      "/:shipmentId",
      requireAuth,
      requireStaff,
      validateParams(shipmentIdParamSchema),
      validateBody(updateShipmentSchema),
      this.shipmentController.updateShipmentController
    );

    // Complete delivery (Staff/Admin only)
    this.router.post(
      "/:shipmentId/complete",
      requireAuth,
      requireStaff,
      validateParams(shipmentIdParamSchema),
      this.shipmentController.completeDeliveryController
    );

    // Delete shipment (Admin only)
    this.router.delete(
      "/:shipmentId",
      requireAuth,
      requireAdmin,
      validateParams(shipmentIdParamSchema),
      this.shipmentController.deleteShipmentController
    );

    // 🔍 PUBLIC TRACKING ENDPOINT

    // Get shipment by tracking number (Public - no auth required)
    this.router.get(
      "/track/:trackingNumber",
      validateParams(trackingNumberParamSchema),
      this.shipmentController.getShipmentByTrackingController
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
