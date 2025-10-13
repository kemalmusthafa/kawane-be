import prisma from "../../prisma";
import { OrderStatus } from "@prisma/client";

export interface CancelOrderData {
  orderId: string;
  userId: string;
}

export const cancelOrderService = async (data: CancelOrderData) => {
  const { orderId, userId } = data;

  // Find the order
  const order = await prisma.order.findFirst({
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
  if (order.status === OrderStatus.CANCELLED) {
    throw new Error("Order is already cancelled");
  }

  if (order.status === OrderStatus.COMPLETED) {
    throw new Error("Cannot cancel completed order");
  }

  if (order.status === OrderStatus.SHIPPED) {
    throw new Error("Cannot cancel shipped order");
  }

  // Use transaction to ensure data consistency
  const result = await prisma.$transaction(async (tx) => {
    // Update order status to cancelled
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: { 
        status: OrderStatus.CANCELLED,
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
