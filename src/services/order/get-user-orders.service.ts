import prisma from "../../prisma";
import { OrderStatus } from "../../../prisma/generated/client";

interface GetUserOrdersParams {
  userId: string;
  status?: OrderStatus;
  page?: number;
  limit?: number;
}

export const getUserOrdersService = async (params: GetUserOrdersParams) => {
  const { userId, status, page = 1, limit = 10 } = params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) throw new Error("User not found");

  const filter: any = { userId };
  if (status) filter.status = status;

  const countOrders = await prisma.order.count({ where: filter });
  const totalPages = Math.ceil(countOrders / limit);

  const orders = await prisma.order.findMany({
    where: filter,
    include: {
      items: {
        include: {
          product: {
            include: {
              images: true,
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
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: limit * (page - 1),
  });

  // Transform orders to match frontend expectations
  const transformedOrders = orders.map((order) => ({
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
  }));

  return {
    orders: transformedOrders,
    pagination: {
      page,
      limit,
      totalItems: countOrders,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};
