import { Request, Response } from "express";
import prisma from "../prisma";
import { createShipmentService } from "../services/shipment/create-shipment.service";
import { updateShipmentService } from "../services/shipment/update-shipment.service";
import { completeDeliveryService } from "../services/shipment/complete-delivery.service";
import {
  getShipmentsService,
  getShipmentByIdService,
  getShipmentByTrackingService,
} from "../services/shipment/get-shipments.service";
import {
  successResponse,
  errorResponse,
} from "../middlewares/async-handler.middleware";

export class ShipmentController {
  // Create shipment (Staff/Admin only)
  async createShipmentController(req: Request, res: Response) {
    try {
      const result = await createShipmentService(req.body);
      successResponse(res, result, "Shipment created successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  // Update shipment (Staff/Admin only)
  async updateShipmentController(req: Request, res: Response) {
    try {
      const { shipmentId } = req.params;
      const result = await updateShipmentService({
        shipmentId,
        ...req.body,
      });
      successResponse(res, result, "Shipment updated successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  // Complete delivery (Staff/Admin only)
  async completeDeliveryController(req: Request, res: Response) {
    try {
      const { shipmentId } = req.params;
      const result = await completeDeliveryService({
        shipmentId,
        ...req.body,
      });
      successResponse(res, result, "Delivery completed successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  // Get shipments with filtering and pagination
  async getShipmentsController(req: Request, res: Response) {
    try {
      const queryData = (req as any).validatedQuery || req.query;
      const user = (req as any).user;
      const userRole = user?.role;
      const userId = user?.id;

      console.log("🔍 getShipmentsController called with:", {
        queryData,
        userId,
        userRole,
        isAdmin: userRole === "ADMIN" || userRole === "STAFF",
      });

      // For admin/staff: don't pass userId (see all shipments)
      // For customer: pass userId (see only their shipments)
      const serviceUserId =
        userRole === "ADMIN" || userRole === "STAFF" ? undefined : userId;

      const result = await getShipmentsService({
        ...queryData,
        userId: serviceUserId, // Admin sees all, Customer sees only their own
      });

      console.log("📦 getShipmentsController result:", {
        shipmentsCount: result.shipments.length,
        total: result.pagination.total,
      });

      successResponse(res, result, "Shipments retrieved successfully");
    } catch (error: any) {
      console.error("❌ getShipmentsController error:", error);
      errorResponse(res, error.message, 500);
    }
  }

  // Get shipment by ID
  async getShipmentByIdController(req: Request, res: Response) {
    try {
      const { shipmentId } = req.params;
      const userId = (req as any).user?.id;

      const result = await getShipmentByIdService(shipmentId);

      // Check if customer is trying to access their own shipment
      if (userId && result.shipment.order.user.id !== userId) {
        return errorResponse(res, "Access denied", 403);
      }

      successResponse(res, result, "Shipment retrieved successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  // Get shipment by tracking number (Public endpoint)
  async getShipmentByTrackingController(req: Request, res: Response) {
    try {
      const { trackingNumber } = req.params;
      const result = await getShipmentByTrackingService(trackingNumber);
      successResponse(res, result, "Shipment retrieved successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  // Get shipment statistics (Staff/Admin only)
  async getShipmentStatsController(req: Request, res: Response) {
    try {
      const queryData = (req as any).validatedQuery || req.query;
      const { startDate, endDate } = queryData;

      console.log("🔍 getShipmentStatsController called with:", {
        startDate,
        endDate,
      });

      // Build date filter
      const dateFilter: any = {};
      if (startDate && endDate) {
        dateFilter.createdAt = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }

      console.log("🔍 getShipmentStatsController dateFilter:", dateFilter);

      // Optimize: Use single query with aggregation instead of Promise.all
      const shipmentsByCarrier = await prisma.shipment.groupBy({
        by: ["courier"],
        where: dateFilter,
        _count: { courier: true },
      });

      console.log(
        "📊 getShipmentStatsController shipmentsByCarrier:",
        shipmentsByCarrier
      );

      // Calculate total from grouped results to avoid second query
      const totalShipments = shipmentsByCarrier.reduce(
        (total, item) => total + item._count.courier,
        0
      );

      console.log(
        "📊 getShipmentStatsController totalShipments:",
        totalShipments
      );

      const result = {
        totalShipments,
        shipmentsByCarrier: shipmentsByCarrier.map((item) => ({
          carrier: item.courier,
          count: item._count.courier,
        })),
      };

      console.log("📊 getShipmentStatsController result:", result);

      successResponse(
        res,
        result,
        "Shipment statistics retrieved successfully"
      );
    } catch (error: any) {
      console.error("❌ getShipmentStatsController error:", error);
      errorResponse(res, error.message, 500);
    }
  }

  // Delete shipment (Admin only)
  async deleteShipmentController(req: Request, res: Response) {
    try {
      const { shipmentId } = req.params;

      // Check if shipment exists
      const shipment = await prisma.shipment.findUnique({
        where: { id: shipmentId },
      });

      if (!shipment) {
        return errorResponse(res, "Shipment not found", 404);
      }

      // Delete shipment
      await prisma.shipment.delete({
        where: { id: shipmentId },
      });

      successResponse(res, { shipmentId }, "Shipment deleted successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }
}
