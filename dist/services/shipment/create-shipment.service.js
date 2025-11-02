"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createShipmentService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const client_1 = require("@prisma/client");
const createShipmentService = async (data) => {
    try {
        // Check if order exists and is ready for shipment
        const order = await prisma_1.default.order.findUnique({
            where: { id: data.orderId },
            include: {
                user: true,
                payment: true, // ✅ FIXED: Include payment data
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
        if (!order) {
            throw new Error("Order not found");
        }
        // ✅ FIXED: More flexible order status validation using enum
        const isReadyForShipment = order.status === client_1.OrderStatus.PAID ||
            order.status === client_1.OrderStatus.COMPLETED ||
            order.status === client_1.OrderStatus.SHIPPED ||
            (order.status === client_1.OrderStatus.PENDING &&
                order.payment?.status === "SUCCEEDED");
        if (!isReadyForShipment) {
            throw new Error("Order is not ready for shipment");
        }
        // Check if shipment already exists for this order
        const existingShipment = await prisma_1.default.shipment.findFirst({
            where: { orderId: data.orderId },
        });
        if (existingShipment) {
            throw new Error("Shipment already exists for this order");
        }
        // Generate tracking number if not provided
        const trackingNumber = data.trackingNumber || generateTrackingNumber();
        // Create shipment
        const shipment = await prisma_1.default.shipment.create({
            data: {
                orderId: data.orderId,
                trackingNo: trackingNumber,
                courier: data.carrier,
                cost: data.cost || 0, // Use provided cost or default to 0
                estimatedDays: data.estimatedDays ||
                    (data.method === "SAME_DAY"
                        ? 1
                        : data.method === "EXPRESS"
                            ? 2
                            : data.method === "OVERNIGHT"
                                ? 1
                                : 3),
            },
            include: {
                order: {
                    include: {
                        user: { select: { id: true, name: true, email: true } },
                        items: {
                            include: {
                                product: { select: { id: true, name: true, sku: true } },
                            },
                        },
                    },
                },
            },
        });
        // Update order status to SHIPPED
        await prisma_1.default.order.update({
            where: { id: data.orderId },
            data: { status: client_1.OrderStatus.SHIPPED },
        });
        // Create notification for customer
        await prisma_1.default.notification.create({
            data: {
                userId: order.userId,
                title: "📦 Order Shipped!",
                description: `Your order #${order.id
                    .substring(0, 8)
                    .toUpperCase()} has been shipped! Track your package with tracking number: ${trackingNumber}`,
                url: `/orders/${order.id}`,
            },
        });
        return {
            message: "Shipment created successfully",
            shipment: {
                id: shipment.id,
                orderId: shipment.orderId,
                trackingNumber: shipment.trackingNo,
                carrier: shipment.courier,
                cost: shipment.cost,
                estimatedDays: shipment.estimatedDays,
                createdAt: shipment.createdAt,
                order: {
                    id: shipment.order.id,
                    status: shipment.order.status,
                    user: shipment.order.user,
                    items: shipment.order.items,
                },
            },
        };
    }
    catch (error) {
        console.error("❌ Create shipment failed:", error);
        throw new Error(error.message || "Failed to create shipment");
    }
};
exports.createShipmentService = createShipmentService;
// Helper function to generate tracking number
function generateTrackingNumber() {
    const prefix = "KS";
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${timestamp}${random}`;
}
