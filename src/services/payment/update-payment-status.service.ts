import prisma from "../../prisma";
import { PaymentStatus } from "../../../prisma/generated/client";

interface UpdatePaymentStatusData {
  paymentId: string;
  status: PaymentStatus;
  transactionId?: string;
}

export const updatePaymentStatusService = async (
  data: UpdatePaymentStatusData
) => {
  const payment = await prisma.payment.findUnique({
    where: { id: data.paymentId },
    include: {
      order: {
        include: { user: true },
      },
    },
  });

  if (!payment) throw new Error("Payment not found");
  if (payment.status === data.status)
    throw new Error("Payment status is already updated");

  const updatedPayment = await prisma.$transaction(async (tx) => {
    // Update payment
    const updatedPaymentResult = await tx.payment.update({
      where: { id: data.paymentId },
      data: {
        status: data.status,
        transactionId: data.transactionId || payment.transactionId,
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

    // Determine order status
    const orderStatus =
      data.status === PaymentStatus.SUCCEEDED
        ? "COMPLETED"
        : data.status === PaymentStatus.CANCELLED
        ? "CANCELLED"
        : data.status === PaymentStatus.EXPIRED
        ? "CANCELLED"
        : "PENDING";

    // Update order status
    await tx.order.update({
      where: { id: payment.orderId },
      data: { status: orderStatus },
    });

    // 🔄 Handle stock restoration for failed payments
    if (
      (data.status === PaymentStatus.CANCELLED ||
        data.status === PaymentStatus.EXPIRED) &&
      payment.status !== data.status
    ) {
      // Restore stock for all items in the cancelled order
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
            note: `Order ${
              payment.orderId
            }: Stock restored due to payment ${data.status.toLowerCase()}`,
          },
        });
      }
    }

    return updatedPaymentResult;
  });

  const statusMessages = {
    [PaymentStatus.SUCCEEDED]: "Payment successful",
    [PaymentStatus.CANCELLED]: "Payment cancelled",
    [PaymentStatus.EXPIRED]: "Payment expired",
    [PaymentStatus.PENDING]: "Payment pending",
  };

  await prisma.notification.create({
    data: {
      userId: payment.order.userId,
      title: "Payment Status Updated",
      description: `${statusMessages[data.status]} for order #${
        payment.orderId
      }`,
      url: `/orders/${payment.orderId}`,
    },
  });

  return updatedPayment;
};
