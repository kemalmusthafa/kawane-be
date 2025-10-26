"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatusService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const client_1 = require("../../../prisma/generated/client");
const updateOrderStatusService = async (data) => {
    const order = await prisma_1.default.order.findUnique({
        where: { id: data.orderId },
        include: {
            user: true,
            items: {
                include: {
                    product: true,
                },
            },
        },
    });
    if (!order)
        throw new Error("Order not found");
    if (order.status === data.status)
        throw new Error(`Order status is already ${data.status.toLowerCase()}. Cannot update to the same status.`);
    const statusMessages = {
        [client_1.OrderStatus.CHECKOUT]: "Order placed successfully",
        [client_1.OrderStatus.PAID]: "Payment received",
        [client_1.OrderStatus.PENDING]: "Order is being processed",
        [client_1.OrderStatus.SHIPPED]: "Order has been shipped",
        [client_1.OrderStatus.COMPLETED]: "Order completed",
        [client_1.OrderStatus.CANCELLED]: "Order cancelled",
    };
    // 🔄 Handle stock restoration for cancelled orders
    if (data.status === client_1.OrderStatus.CANCELLED &&
        order.status !== client_1.OrderStatus.CANCELLED) {
        // Restore stock for all items in the cancelled order
        await prisma_1.default.$transaction(async (tx) => {
            // Update order status
            await tx.order.update({
                where: { id: data.orderId },
                data: { status: data.status },
            });
            // Restore stock for each item
            for (const item of order.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { increment: item.quantity } },
                });
                // Create inventory log for stock restoration
                await tx.inventoryLog.create({
                    data: {
                        productId: item.productId,
                        change: item.quantity,
                        note: `Order ${data.orderId}: Stock restored due to cancellation`,
                    },
                });
            }
        });
    }
    else {
        // For non-cancellation status updates, just update the order
        await prisma_1.default.order.update({
            where: { id: data.orderId },
            data: { status: data.status },
        });
    }
    const updatedOrder = await prisma_1.default.order.findUnique({
        where: { id: data.orderId },
        include: {
            user: true,
            items: {
                include: {
                    product: true,
                },
            },
        },
    });
    // 🔔 Create notification for customer
    const notificationData = {
        userId: order.userId,
        title: getNotificationTitle(data.status),
        description: getNotificationMessage(data.status, order),
        isRead: false,
    };
    await prisma_1.default.notification.create({
        data: notificationData,
    });
    return updatedOrder;
};
exports.updateOrderStatusService = updateOrderStatusService;
// Helper functions untuk notification
function getNotificationTitle(status) {
    switch (status) {
        case client_1.OrderStatus.CHECKOUT:
            return "🛒 Order Placed Successfully";
        case client_1.OrderStatus.PAID:
            return "💰 Payment Received";
        case client_1.OrderStatus.PENDING:
            return "⏳ Order Being Processed";
        case client_1.OrderStatus.SHIPPED:
            return "📦 Order Shipped";
        case client_1.OrderStatus.COMPLETED:
            return "✅ Order Delivered";
        case client_1.OrderStatus.CANCELLED:
            return "❌ Order Cancelled";
        default:
            return "Order Status Updated";
    }
}
function getNotificationMessage(status, order) {
    const orderNumber = order.id.substring(0, 8).toUpperCase();
    const productNames = order.items
        .map((item) => item.product.name)
        .join(", ");
    switch (status) {
        case client_1.OrderStatus.CHECKOUT:
            return `Your order #${orderNumber} has been placed successfully! We're preparing your items: ${productNames}`;
        case client_1.OrderStatus.PAID:
            return `Payment for order #${orderNumber} has been received. Your order is now being processed.`;
        case client_1.OrderStatus.PENDING:
            return `Order #${orderNumber} is being processed. We'll ship it soon!`;
        case client_1.OrderStatus.SHIPPED:
            return `Order #${orderNumber} has been shipped! Track your package with the provided tracking number.`;
        case client_1.OrderStatus.COMPLETED:
            return `Order #${orderNumber} has been delivered! Enjoy your purchase: ${productNames}`;
        case client_1.OrderStatus.CANCELLED:
            return `Order #${orderNumber} has been cancelled. Refund will be processed if payment was made.`;
        default:
            return `Order #${orderNumber} status updated to ${status}`;
    }
}
