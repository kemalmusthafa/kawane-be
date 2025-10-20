import prisma from "../../prisma";
import { OrderStatus } from "../../../prisma/generated/client";

interface UpdateOrderStatusData {
  orderId: string;
  status: OrderStatus;
}

export const updateOrderStatusService = async (data: UpdateOrderStatusData) => {
  const order = await prisma.order.findUnique({
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

  if (!order) throw new Error("Order not found");
  if (order.status === data.status)
    throw new Error("Order status is already updated");

  const statusMessages = {
    [OrderStatus.CHECKOUT]: "Order placed successfully",
    [OrderStatus.PAID]: "Payment received",
    [OrderStatus.PENDING]: "Order is being processed",
    [OrderStatus.SHIPPED]: "Order has been shipped",
    [OrderStatus.COMPLETED]: "Order completed",
    [OrderStatus.CANCELLED]: "Order cancelled",
  };

  // 🔄 Handle stock restoration for cancelled orders
  if (
    data.status === OrderStatus.CANCELLED &&
    order.status !== OrderStatus.CANCELLED
  ) {
    // Restore stock for all items in the cancelled order
    await prisma.$transaction(async (tx) => {
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
  } else {
    // For non-cancellation status updates, just update the order
    await prisma.order.update({
      where: { id: data.orderId },
      data: { status: data.status },
    });
  }

  const updatedOrder = await prisma.order.findUnique({
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

  await prisma.notification.create({
    data: notificationData,
  });

  return updatedOrder;
};

// Helper functions untuk notification
function getNotificationTitle(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.CHECKOUT:
      return "🛒 Order Placed Successfully";
    case OrderStatus.PAID:
      return "💰 Payment Received";
    case OrderStatus.PENDING:
      return "⏳ Order Being Processed";
    case OrderStatus.SHIPPED:
      return "📦 Order Shipped";
    case OrderStatus.COMPLETED:
      return "✅ Order Delivered";
    case OrderStatus.CANCELLED:
      return "❌ Order Cancelled";
    default:
      return "Order Status Updated";
  }
}

function getNotificationMessage(status: OrderStatus, order: any): string {
  const orderNumber = order.id.substring(0, 8).toUpperCase();
  const productNames = order.items
    .map((item: any) => item.product.name)
    .join(", ");

  switch (status) {
    case OrderStatus.CHECKOUT:
      return `Your order #${orderNumber} has been placed successfully! We're preparing your items: ${productNames}`;
    case OrderStatus.PAID:
      return `Payment for order #${orderNumber} has been received. Your order is now being processed.`;
    case OrderStatus.PENDING:
      return `Order #${orderNumber} is being processed. We'll ship it soon!`;
    case OrderStatus.SHIPPED:
      return `Order #${orderNumber} has been shipped! Track your package with the provided tracking number.`;
    case OrderStatus.COMPLETED:
      return `Order #${orderNumber} has been delivered! Enjoy your purchase: ${productNames}`;
    case OrderStatus.CANCELLED:
      return `Order #${orderNumber} has been cancelled. Refund will be processed if payment was made.`;
    default:
      return `Order #${orderNumber} status updated to ${status}`;
  }
}
