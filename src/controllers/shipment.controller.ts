import { Request, Response } from "express";
import prisma from "../prisma";
import { createShipmentService } from "../services/shipment/create-shipment.service";
import { updateShipmentService } from "../services/shipment/update-shipment.service";
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

  // Get shipments with filtering and pagination
  async getShipmentsController(req: Request, res: Response) {
    try {
      const queryData = (req as any).validatedQuery || req.query;
      const userId = (req as any).user?.id; // For customer to see their own shipments

      const result = await getShipmentsService({
        ...queryData,
        userId: userId, // Customer can only see their own shipments
      });

      successResponse(res, result, "Shipments retrieved successfully");
    } catch (error: any) {
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

      // Build date filter
      const dateFilter: any = {};
      if (startDate && endDate) {
        dateFilter.createdAt = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }

      // Get shipment statistics
      const [totalShipments, shipmentsByCarrier] = await Promise.all([
        prisma.shipment.count({ where: dateFilter }),
        prisma.shipment.groupBy({
          by: ["courier"],
          where: dateFilter,
          _count: { courier: true },
        }),
      ]);

      const result = {
        totalShipments,
        shipmentsByCarrier: shipmentsByCarrier.map((item) => ({
          carrier: item.courier,
          count: item._count.courier,
        })),
      };

      successResponse(
        res,
        result,
        "Shipment statistics retrieved successfully"
      );
    } catch (error: any) {
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
