"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const client_1 = require("../../../prisma/generated/client");
const createPaymentService = async (data) => {
    // Validate order exists and is ready for payment
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
    if (order.payment)
        throw new Error("Payment already exists for this order");
    if (order.status !== "PENDING" && order.status !== "CHECKOUT")
        throw new Error("Order is not ready for payment");
    if (order.isPaid)
        throw new Error("Order is already paid");
    if (Math.abs(data.amount - order.totalAmount) > 0.01) {
        throw new Error("Payment amount does not match order total");
    }
    // Create payment record
    const payment = await prisma_1.default.payment.create({
        data: {
            orderId: data.orderId,
            method: data.method,
            amount: data.amount,
            transactionId: data.transactionId,
            status: client_1.PaymentStatus.PENDING,
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
    // Create notification for payment processing
    await prisma_1.default.notification.create({
        data: {
            userId: order.userId,
            title: "Payment Processing",
            description: `Payment of Rp ${data.amount.toLocaleString("id-ID")} is being processed for order #${data.orderId}`,
            url: `/orders/${data.orderId}`,
        },
    });
    console.log(`✅ Payment created for order ${data.orderId}:`, {
        paymentId: payment.id,
        amount: data.amount,
        method: data.method,
        status: client_1.PaymentStatus.PENDING,
    });
    return payment;
};
exports.createPaymentService = createPaymentService;
