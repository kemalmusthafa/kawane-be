import prisma from "../../prisma";
import { OrderStatus, PaymentStatus } from "../../../prisma/generated/client";

interface GetDashboardStatsParams {
  startDate?: Date;
  endDate?: Date;
}

export const getDashboardStatsService = async (
  params: GetDashboardStatsParams = {}
) => {
  const { startDate, endDate } = params;

  const dateFilter: any = {};
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) dateFilter.createdAt.gte = startDate;
    if (endDate) dateFilter.createdAt.lte = endDate;
  }

  const [
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue,
    pendingOrders,
    lowStockProducts,
    recentOrders,
    topProducts,
  ] = await Promise.all([
    prisma.user.count({
      where: {
        ...dateFilter,
        role: "CUSTOMER",
      },
    }),
    prisma.product.count(),
    prisma.order.count({ where: dateFilter }),
    prisma.order.aggregate({
      where: {
        ...dateFilter,
        status: "COMPLETED",
      },
      _sum: {
        totalAmount: true,
      },
    }),
    prisma.order.count({
      where: {
        ...dateFilter,
        status: "PENDING",
      },
    }),
    prisma.product.count({
      where: {
        stock: {
          lte: 10,
        },
      },
    }),
    prisma.order.findMany({
      where: dateFilter,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
        payment: {
          select: {
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      where: dateFilter,
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    }),
  ]);

  const topProductsWithDetails = await Promise.all(
    topProducts.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: {
          id: true,
          name: true,
          price: true,
          images: true,
        },
      });
      return {
        ...product,
        totalSold: item._sum.quantity || 0,
      };
    })
  );

  const monthlyRevenue = await prisma.order.groupBy({
    by: ["createdAt"],
    where: {
      ...dateFilter,
      status: "COMPLETED",
    },
    _sum: {
      totalAmount: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return {
    overview: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      pendingOrders,
      lowStockProducts,
    },
    recentOrders: recentOrders.map((order) => ({
      ...order,
      paymentStatus: order.payment?.status || "PENDING",
    })),
    topProducts: topProductsWithDetails,
    monthlyRevenue: monthlyRevenue.map((item) => ({
      date: item.createdAt,
      revenue: item._sum.totalAmount || 0,
    })),
  };
};
