"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePaymentStatusManualService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const client_1 = require("../../../prisma/generated/client");
const updatePaymentStatusManualService = async (data) => {
    // Find the order and its payment
    const order = await prisma_1.default.order.findUnique({
        where: { id: data.orderId },
        include: {
            payment: true,
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
    if (!order.payment)
        throw new Error("Payment record not found");
    // Update payment status
    const updatedPayment = await prisma_1.default.$transaction(async (tx) => {
        // Update payment status
        const updatedPaymentResult = await tx.payment.update({
            where: { id: order.payment.id },
            data: {
                status: data.status,
                adminConfirmed: data.status === client_1.PaymentStatus.SUCCEEDED,
                updatedAt: new Date(),
            },
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
        // Update order status based on payment status
        let orderStatus = order.status;
        if (data.status === client_1.PaymentStatus.SUCCEEDED) {
            orderStatus = "PAID";
        }
        else if (data.status === client_1.PaymentStatus.CANCELLED ||
            data.status === client_1.PaymentStatus.EXPIRED) {
            orderStatus = "CANCELLED";
        }
        else if (data.status === client_1.PaymentStatus.PENDING) {
            orderStatus = "PENDING";
        }
        // Update order status
        await tx.order.update({
            where: { id: data.orderId },
            data: { status: orderStatus },
        });
        // ✅ Reduce stock when payment is SUCCEEDED
        if (data.status === client_1.PaymentStatus.SUCCEEDED &&
            order.payment &&
            order.payment.status !== client_1.PaymentStatus.SUCCEEDED) {
            // Reduce stock for all items in the order
            for (const item of updatedPaymentResult.order.items) {
                // Decrement size-specific stock if size is provided
                if (item.size) {
                    await tx.productSize.updateMany({
                        where: {
                            productId: item.productId,
                            size: item.size,
                        },
                        data: {
                            stock: { decrement: item.quantity },
                        },
                    });
                }
                // Always decrement general product stock
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } },
                });
                // Create inventory log
                await tx.inventoryLog.create({
                    data: {
                        productId: item.productId,
                        change: -item.quantity,
                        note: `Order ${data.orderId}: Sale (Payment confirmed manually)${item.size ? ` (Size: ${item.size})` : ""}`,
                    },
                });
            }
        }
        // 🔄 Handle stock restoration for failed payments
        if ((data.status === client_1.PaymentStatus.CANCELLED ||
            data.status === client_1.PaymentStatus.EXPIRED) &&
            order.payment &&
            order.payment.status !== data.status &&
            order.payment.status === client_1.PaymentStatus.SUCCEEDED) {
            // Restore stock for all items in the cancelled order (only if payment was previously succeeded)
            for (const item of updatedPaymentResult.order.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { increment: item.quantity } },
                });
                // Create inventory log for stock restoration
                await tx.inventoryLog.create({
                    data: {
                        productId: item.productId,
                        change: item.quantity,
                        note: `Order ${data.orderId}: Stock restored due to payment ${data.status.toLowerCase()}`,
                    },
                });
            }
        }
        return updatedPaymentResult;
    });
    // Create notification for customer
    const statusMessages = {
        [client_1.PaymentStatus.SUCCEEDED]: "Payment confirmed",
        [client_1.PaymentStatus.CANCELLED]: "Payment cancelled",
        [client_1.PaymentStatus.EXPIRED]: "Payment expired",
        [client_1.PaymentStatus.PENDING]: "Payment pending",
    };
    await prisma_1.default.notification.create({
        data: {
            userId: order.userId,
            title: "💳 Payment Status Updated",
            description: `${statusMessages[data.status]} for order #${order.id
                .substring(0, 8)
                .toUpperCase()}. ${data.adminNotes || ""}`,
            url: `/orders/${order.id}`,
            type: "payment",
            priority: "high",
        },
    });
    return {
        payment: updatedPayment,
        order: {
            id: order.id,
            status: updatedPayment.order.status,
            paymentStatus: updatedPayment.status,
        },
    };
};
exports.updatePaymentStatusManualService = updatePaymentStatusManualService;
