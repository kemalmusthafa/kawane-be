import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class AnalyticsService {
  async getAnalytics(period: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    // Get overview data
    // Optimize: Split into smaller batches to avoid connection pool timeout
    const [totalRevenue, totalOrders, totalCustomers, totalProducts] =
      await Promise.all([
        // Current period totals - only count orders with PAID payment status
        prisma.order.aggregate({
          where: {
            createdAt: { gte: startDate },
            payment: {
              status: "SUCCEEDED",
            },
          },
          _sum: { totalAmount: true },
        }),
        prisma.order.count({
          where: { createdAt: { gte: startDate } },
        }),
        prisma.user.count({
          where: {
            createdAt: { gte: startDate },
            role: "CUSTOMER",
          },
        }),
        prisma.product.count(),
      ]);

    const [
      previousPeriodRevenue,
      previousPeriodOrders,
      previousPeriodCustomers,
    ] = await Promise.all([
      // Previous period for comparison - only count orders with PAID payment status
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: new Date(startDate.getTime() - period * 24 * 60 * 60 * 1000),
            lt: startDate,
          },
          payment: {
            status: "SUCCEEDED",
          },
        },
        _sum: { totalAmount: true },
      }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(startDate.getTime() - period * 24 * 60 * 60 * 1000),
            lt: startDate,
          },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(startDate.getTime() - period * 24 * 60 * 60 * 1000),
            lt: startDate,
          },
          role: "CUSTOMER",
        },
      }),
    ]);

    // Calculate growth percentages
    const revenueGrowth = this.calculateGrowth(
      previousPeriodRevenue._sum.totalAmount || 0,
      totalRevenue._sum.totalAmount || 0
    );
    const ordersGrowth = this.calculateGrowth(
      previousPeriodOrders,
      totalOrders
    );
    const customersGrowth = this.calculateGrowth(
      previousPeriodCustomers,
      totalCustomers
    );

    // Get sales data by month
    const salesData = await this.getSalesData(period);

    // Get top products
    const topProducts = await this.getTopProducts(period);

    // Get recent orders
    const recentOrders = await this.getRecentOrders();

    return {
      overview: {
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        totalOrders,
        totalCustomers,
        totalProducts,
        revenueGrowth,
        ordersGrowth,
        customersGrowth,
        productsGrowth: 0, // Products don't have growth concept
      },
      salesData,
      topProducts,
      recentOrders,
    };
  }

  private calculateGrowth(previous: number, current: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100 * 100) / 100;
  }

  private async getSalesData(period: number) {
    const months = [];
    const currentDate = new Date();

    for (let i = period - 1; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const sales = await prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfDay, lte: endOfDay },
          payment: {
            status: "SUCCEEDED",
          },
        },
        _sum: { totalAmount: true },
      });

      months.push({
        month: date.toLocaleDateString("en-US", { month: "short" }),
        sales: sales._sum.totalAmount || 0,
      });
    }

    return months;
  }

  private async getTopProducts(period: number) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    // ✅ OPTIMIZED: Use single transaction to avoid N+1 queries
    const result = await prisma.$transaction(async (tx) => {
      // Get all order items for the period
      const orderItems = await tx.orderItem.findMany({
        where: {
          order: {
            createdAt: { gte: startDate },
            payment: {
              status: "SUCCEEDED",
            },
          },
        },
        select: {
          productId: true,
          quantity: true,
          price: true,
        },
      });

      // Group by productId and calculate totals
      const productMap = new Map<
        string,
        { quantity: number; revenue: number }
      >();

      orderItems.forEach((item) => {
        const existing = productMap.get(item.productId) || {
          quantity: 0,
          revenue: 0,
        };
        productMap.set(item.productId, {
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + item.price * item.quantity,
        });
      });

      // Convert to array and sort by quantity
      const topProductsArray = Array.from(productMap.entries())
        .map(([productId, data]) => ({
          productId,
          quantity: data.quantity,
          revenue: data.revenue,
        }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      // ✅ OPTIMIZED: Single query for all product details
      const productIds = topProductsArray.map((item) => item.productId);
      const products =
        productIds.length > 0
          ? await tx.product.findMany({
              where: { id: { in: productIds } },
              select: { id: true, name: true },
            })
          : [];

      // Combine data efficiently
      const productsWithDetails = topProductsArray.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return {
          name: product?.name || "Unknown Product",
          sales: item.quantity,
          revenue: item.revenue,
        };
      });

      return productsWithDetails;
    });

    return result;
  }

  private async getRecentOrders() {
    const recentOrders = await prisma.order.findMany({
      where: {
        payment: {
          status: "SUCCEEDED",
        },
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
        payment: {
          select: { status: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return recentOrders.map((order) => ({
      id: order.id,
      customer: order.user?.name || "Unknown Customer",
      amount: order.totalAmount,
      status: order.status,
      date: order.createdAt.toISOString().split("T")[0],
    }));
  }
}
