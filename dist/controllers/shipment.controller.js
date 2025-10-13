"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShipmentController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const create_shipment_service_1 = require("../services/shipment/create-shipment.service");
const update_shipment_service_1 = require("../services/shipment/update-shipment.service");
const get_shipments_service_1 = require("../services/shipment/get-shipments.service");
const async_handler_middleware_1 = require("../middlewares/async-handler.middleware");
class ShipmentController {
    // Create shipment (Staff/Admin only)
    async createShipmentController(req, res) {
        try {
            const result = await (0, create_shipment_service_1.createShipmentService)(req.body);
            (0, async_handler_middleware_1.successResponse)(res, result, "Shipment created successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    // Update shipment (Staff/Admin only)
    async updateShipmentController(req, res) {
        try {
            const { shipmentId } = req.params;
            const result = await (0, update_shipment_service_1.updateShipmentService)({
                shipmentId,
                ...req.body,
            });
            (0, async_handler_middleware_1.successResponse)(res, result, "Shipment updated successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    // Get shipments with filtering and pagination
    async getShipmentsController(req, res) {
        try {
            const queryData = req.validatedQuery || req.query;
            const userId = req.user?.id; // For customer to see their own shipments
            const result = await (0, get_shipments_service_1.getShipmentsService)({
                ...queryData,
                userId: userId, // Customer can only see their own shipments
            });
            (0, async_handler_middleware_1.successResponse)(res, result, "Shipments retrieved successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
    // Get shipment by ID
    async getShipmentByIdController(req, res) {
        try {
            const { shipmentId } = req.params;
            const userId = req.user?.id;
            const result = await (0, get_shipments_service_1.getShipmentByIdService)(shipmentId);
            // Check if customer is trying to access their own shipment
            if (userId && result.shipment.order.user.id !== userId) {
                return (0, async_handler_middleware_1.errorResponse)(res, "Access denied", 403);
            }
            (0, async_handler_middleware_1.successResponse)(res, result, "Shipment retrieved successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
    // Get shipment by tracking number (Public endpoint)
    async getShipmentByTrackingController(req, res) {
        try {
            const { trackingNumber } = req.params;
            const result = await (0, get_shipments_service_1.getShipmentByTrackingService)(trackingNumber);
            (0, async_handler_middleware_1.successResponse)(res, result, "Shipment retrieved successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
    // Get shipment statistics (Staff/Admin only)
    async getShipmentStatsController(req, res) {
        try {
            const queryData = req.validatedQuery || req.query;
            const { startDate, endDate } = queryData;
            // Build date filter
            const dateFilter = {};
            if (startDate && endDate) {
                dateFilter.createdAt = {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                };
            }
            // Get shipment statistics
            const [totalShipments, shipmentsByCarrier] = await Promise.all([
                prisma_1.default.shipment.count({ where: dateFilter }),
                prisma_1.default.shipment.groupBy({
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
            (0, async_handler_middleware_1.successResponse)(res, result, "Shipment statistics retrieved successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
    // Delete shipment (Admin only)
    async deleteShipmentController(req, res) {
        try {
            const { shipmentId } = req.params;
            // Check if shipment exists
            const shipment = await prisma_1.default.shipment.findUnique({
                where: { id: shipmentId },
            });
            if (!shipment) {
                return (0, async_handler_middleware_1.errorResponse)(res, "Shipment not found", 404);
            }
            // Delete shipment
            await prisma_1.default.shipment.delete({
                where: { id: shipmentId },
            });
            (0, async_handler_middleware_1.successResponse)(res, { shipmentId }, "Shipment deleted successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
}
exports.ShipmentController = ShipmentController;
