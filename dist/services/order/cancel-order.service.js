"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrderService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const client_1 = require("@prisma/client");
const cancelOrderService = async (data) => {
    const { orderId, userId } = data;
    // Find the order
    const order = await prisma_1.default.order.findFirst({
        where: {
            id: orderId,
            userId: userId,
        },
        include: {
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
    // Check if order can be cancelled
    if (order.status === client_1.OrderStatus.CANCELLED) {
        throw new Error("Order is already cancelled");
    }
    if (order.status === client_1.OrderStatus.COMPLETED) {
        throw new Error("Cannot cancel completed order");
    }
    if (order.status === client_1.OrderStatus.SHIPPED) {
        throw new Error("Cannot cancel shipped order");
    }
    // Use transaction to ensure data consistency
    const result = await prisma_1.default.$transaction(async (tx) => {
        // Update order status to cancelled
        const updatedOrder = await tx.order.update({
            where: { id: orderId },
            data: {
                status: client_1.OrderStatus.CANCELLED,
                updatedAt: new Date(),
            },
        });
        // Restore stock for all items in the cancelled order
        for (const item of order.items) {
            await tx.product.update({
                where: { id: item.productId },
                data: {
                    stock: {
                        increment: item.quantity,
                    },
                },
            });
            // Log the stock restoration
            await tx.inventoryLog.create({
                data: {
                    productId: item.productId,
                    change: item.quantity,
                    note: `Order ${orderId} cancelled - stock restored`,
                },
            });
        }
        return updatedOrder;
    });
    return {
        message: "Order cancelled successfully",
        order: result,
    };
};
exports.cancelOrderService = cancelOrderService;
