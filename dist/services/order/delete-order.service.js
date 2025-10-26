"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrderService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const client_1 = require("../../../prisma/generated/client");
const deleteOrderService = async (data) => {
    const { orderId } = data;
    // Find the order with all related data
    const order = await prisma_1.default.order.findUnique({
        where: { id: orderId },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
            payment: true,
            shipment: true,
            address: true,
        },
    });
    if (!order) {
        throw new Error("Order not found");
    }
    // Check if order can be deleted (allow pending and cancelled orders to be deleted)
    if (order.status === client_1.OrderStatus.COMPLETED) {
        throw new Error("Completed orders cannot be deleted. Please cancel the order first.");
    }
    // Use transaction to ensure data consistency
    const result = await prisma_1.default.$transaction(async (tx) => {
        // Delete related records first (due to foreign key constraints)
        // Delete inventory logs related to this order
        await tx.inventoryLog.deleteMany({
            where: {
                note: {
                    contains: orderId,
                },
            },
        });
        // Delete order items
        await tx.orderItem.deleteMany({
            where: { orderId },
        });
        // Delete payment if exists
        if (order.payment) {
            await tx.payment.delete({
                where: { orderId },
            });
        }
        // Delete shipment if exists
        if (order.shipment) {
            await tx.shipment.delete({
                where: { orderId },
            });
        }
        // Delete address if exists and not used by other orders
        if (order.address) {
            const addressUsageCount = await tx.order.count({
                where: { addressId: order.addressId },
            });
            if (addressUsageCount <= 1) {
                await tx.address.delete({
                    where: { id: order.addressId },
                });
            }
        }
        // Finally, delete the order
        await tx.order.delete({
            where: { id: orderId },
        });
        return { orderId, deletedAt: new Date() };
    });
    return {
        message: "Order deleted successfully",
        data: result,
    };
};
exports.deleteOrderService = deleteOrderService;
