"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeDeliveryService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const completeDeliveryService = async (data) => {
    try {
        // Check if shipment exists
        const shipment = await prisma_1.default.shipment.findUnique({
            where: { id: data.shipmentId },
            include: {
                order: {
                    include: {
                        user: true,
                        items: {
                            include: {
                                product: true,
                            },
                        },
                    },
                },
            },
        });
        if (!shipment) {
            throw new Error("Shipment not found");
        }
        // Update order status to COMPLETED
        await prisma_1.default.order.update({
            where: { id: shipment.orderId },
            data: {
                status: "COMPLETED",
                updatedAt: new Date(),
            },
        });
        // Create notification for customer about delivery completion
        await prisma_1.default.notification.create({
            data: {
                userId: shipment.order.userId,
                title: "🎉 Order Delivered!",
                description: `Your order #${shipment.order.id
                    .substring(0, 8)
                    .toUpperCase()} has been delivered successfully! Thank you for shopping with us.`,
                url: `/orders/${shipment.order.id}`,
                type: "shipping",
                priority: "high",
            },
        });
        return {
            message: "Delivery completed successfully",
            order: {
                id: shipment.order.id,
                status: "COMPLETED",
                user: shipment.order.user,
                items: shipment.order.items,
            },
        };
    }
    catch (error) {
        console.error("❌ Complete delivery failed:", error);
        throw new Error(error.message || "Failed to complete delivery");
    }
};
exports.completeDeliveryService = completeDeliveryService;
