import prisma from "../../prisma";
import { PaymentStatus } from "../../../prisma/generated/client";

interface UpdatePaymentStatusManualData {
  orderId: string;
  status: PaymentStatus;
  adminNotes?: string;
}

export const updatePaymentStatusManualService = async (
  data: UpdatePaymentStatusManualData
) => {
  // Find the order and its payment
  const order = await prisma.order.findUnique({
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

  if (!order) throw new Error("Order not found");
  if (!order.payment) throw new Error("Payment record not found");

  // Update payment status
  const updatedPayment = await prisma.$transaction(async (tx) => {
    // Update payment status
    const updatedPaymentResult = await tx.payment.update({
      where: { id: order.payment!.id },
      data: {
        status: data.status,
        adminConfirmed: data.status === PaymentStatus.SUCCEEDED,
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
    if (data.status === PaymentStatus.SUCCEEDED) {
      orderStatus = "PAID";
    } else if (
      data.status === PaymentStatus.CANCELLED ||
      data.status === PaymentStatus.EXPIRED
    ) {
      orderStatus = "CANCELLED";
    } else if (data.status === PaymentStatus.PENDING) {
      orderStatus = "PENDING";
    }

    // Update order status
    await tx.order.update({
      where: { id: data.orderId },
      data: { status: orderStatus },
    });

    return updatedPaymentResult;
  });

  // Create notification for customer
  const statusMessages = {
    [PaymentStatus.SUCCEEDED]: "Payment confirmed",
    [PaymentStatus.CANCELLED]: "Payment cancelled",
    [PaymentStatus.EXPIRED]: "Payment expired",
    [PaymentStatus.PENDING]: "Payment pending",
  };

  await prisma.notification.create({
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
