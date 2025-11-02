import prisma from "../../prisma";
import { OrderStatus } from "../../../prisma/generated/client";

interface GetAllOrdersParams {
  status?: OrderStatus;
  paymentStatus?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export const getAllOrdersService = async (params: GetAllOrdersParams) => {
  const { status, paymentStatus, page = 1, limit = 10, search } = params;

  const filter: any = {};
  if (status) filter.status = status;
  if (paymentStatus) {
    filter.payment = {
      status: paymentStatus,
    };
  }

  // Add search functionality
  if (search) {
    filter.OR = [
      { id: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  const countOrders = await prisma.order.count({ where: filter });
  const totalPages = Math.ceil(countOrders / limit);

  const orders = await prisma.order.findMany({
    where: filter,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
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
    status: order.status, // ✅ FIXED: Keep original case
    paymentStatus: order.payment?.status || "PENDING", // ✅ FIXED: Keep original case
    totalAmount: order.totalAmount,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    user: {
      // ✅ FIXED: Use 'user' instead of 'customer'
      id: order.user.id,
      name: order.user.name || "Unknown Customer",
      email: order.user.email,
    },
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
