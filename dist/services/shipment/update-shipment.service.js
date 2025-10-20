"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateShipmentService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const updateShipmentService = async (data) => {
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
        // Prepare update data
        const updateData = {};
        if (data.trackingNo)
            updateData.trackingNo = data.trackingNo;
        if (data.courier)
            updateData.courier = data.courier;
        if (data.cost !== undefined)
            updateData.cost = data.cost;
        if (data.estimatedDays !== undefined)
            updateData.estimatedDays = data.estimatedDays;
        // Update shipment
        const updatedShipment = await prisma_1.default.shipment.update({
            where: { id: data.shipmentId },
            data: updateData,
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
        // Create notification for customer about shipment update
        await prisma_1.default.notification.create({
            data: {
                userId: shipment.order.userId,
                title: "📦 Shipment Updated",
                description: `Your order #${shipment.order.id
                    .substring(0, 8)
                    .toUpperCase()} shipment has been updated.`,
                url: `/orders/${shipment.order.id}`,
            },
        });
        return {
            message: "Shipment updated successfully",
            shipment: {
                id: updatedShipment.id,
                orderId: updatedShipment.orderId,
                trackingNumber: updatedShipment.trackingNo,
                carrier: updatedShipment.courier,
                cost: updatedShipment.cost,
                estimatedDays: updatedShipment.estimatedDays,
                createdAt: updatedShipment.createdAt,
                order: {
                    id: updatedShipment.order.id,
                    status: updatedShipment.order.status,
                    user: updatedShipment.order.user,
                    items: updatedShipment.order.items,
                },
            },
        };
    }
    catch (error) {
        console.error("❌ Update shipment failed:", error);
        throw new Error(error.message || "Failed to update shipment");
    }
};
exports.updateShipmentService = updateShipmentService;
