"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShipmentController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const create_shipment_service_1 = require("../services/shipment/create-shipment.service");
const update_shipment_service_1 = require("../services/shipment/update-shipment.service");
const complete_delivery_service_1 = require("../services/shipment/complete-delivery.service");
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
    // Complete delivery (Staff/Admin only)
    async completeDeliveryController(req, res) {
        try {
            const { shipmentId } = req.params;
            const result = await (0, complete_delivery_service_1.completeDeliveryService)({
                shipmentId,
                ...req.body,
            });
            (0, async_handler_middleware_1.successResponse)(res, result, "Delivery completed successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    // Get shipments with filtering and pagination
    async getShipmentsController(req, res) {
        try {
            const queryData = req.validatedQuery || req.query;
            const user = req.user;
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
            const serviceUserId = userRole === "ADMIN" || userRole === "STAFF" ? undefined : userId;
            const result = await (0, get_shipments_service_1.getShipmentsService)({
                ...queryData,
                userId: serviceUserId, // Admin sees all, Customer sees only their own
            });
            console.log("📦 getShipmentsController result:", {
                shipmentsCount: result.shipments.length,
                total: result.pagination.total,
            });
            (0, async_handler_middleware_1.successResponse)(res, result, "Shipments retrieved successfully");
        }
        catch (error) {
            console.error("❌ getShipmentsController error:", error);
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
            console.log("🔍 getShipmentStatsController called with:", {
                startDate,
                endDate,
            });
            // Build date filter
            const dateFilter = {};
            if (startDate && endDate) {
                dateFilter.createdAt = {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                };
            }
            console.log("🔍 getShipmentStatsController dateFilter:", dateFilter);
            // Optimize: Use single query with aggregation instead of Promise.all
            const shipmentsByCarrier = await prisma_1.default.shipment.groupBy({
                by: ["courier"],
                where: dateFilter,
                _count: { courier: true },
            });
            console.log("📊 getShipmentStatsController shipmentsByCarrier:", shipmentsByCarrier);
            // Calculate total from grouped results to avoid second query
            const totalShipments = shipmentsByCarrier.reduce((total, item) => total + item._count.courier, 0);
            console.log("📊 getShipmentStatsController totalShipments:", totalShipments);
            const result = {
                totalShipments,
                shipmentsByCarrier: shipmentsByCarrier
                    .map((item) => ({
                    carrier: item.courier,
                    count: item._count.courier,
                }))
                    .sort((a, b) => b.count - a.count), // Sort by count descending
            };
            console.log("📊 getShipmentStatsController result:", result);
            (0, async_handler_middleware_1.successResponse)(res, result, "Shipment statistics retrieved successfully");
        }
        catch (error) {
            console.error("❌ getShipmentStatsController error:", error);
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
