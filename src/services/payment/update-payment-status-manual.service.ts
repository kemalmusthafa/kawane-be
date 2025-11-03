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

    // ✅ Reduce stock when payment is SUCCEEDED
    if (
      data.status === PaymentStatus.SUCCEEDED &&
      order.payment &&
      order.payment.status !== PaymentStatus.SUCCEEDED
    ) {
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
            note: `Order ${data.orderId}: Sale (Payment confirmed manually)${
              item.size ? ` (Size: ${item.size})` : ""
            }`,
          },
        });
      }
    }

    // 🔄 Handle stock restoration for failed payments
    if (
      (data.status === PaymentStatus.CANCELLED ||
        data.status === PaymentStatus.EXPIRED) &&
      order.payment &&
      order.payment.status !== data.status &&
      order.payment.status === PaymentStatus.SUCCEEDED
    ) {
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
