import prisma from "../../prisma";

interface GetOrderDetailParams {
  orderId: string;
  userId: string;
}

export const getOrderDetailService = async (params: GetOrderDetailParams) => {
  const { orderId, userId } = params;

  // First check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) throw new Error("User not found");

  // Get order with all related data
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: true,
              category: true,
            },
          },
        },
      },
      payment: true,
      shipment: {
        include: {
          address: true,
        },
      },
      address: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!order) throw new Error("Order not found");

  // Check if user owns this order (for security)
  if (order.userId !== userId) {
    throw new Error("Access denied: You can only view your own orders");
  }

  // Transform order to match frontend expectations
  const transformedOrder = {
    id: order.id,
    orderNumber: order.id, // Use ID as order number for now
    status: order.status.toLowerCase(),
    paymentStatus: order.payment?.status?.toLowerCase() || "pending",
    totalAmount: order.totalAmount,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: order.items,
    payment: order.payment,
    shipment: order.shipment,
    address: order.address,
    customer: {
      id: order.user.id,
      name: order.user.name || "Unknown Customer",
      email: order.user.email,
    },
  };

  return transformedOrder;
};
