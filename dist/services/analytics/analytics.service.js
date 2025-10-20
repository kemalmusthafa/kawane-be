"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AnalyticsService {
    async getAnalytics(period = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - period);
        // Get overview data
        // Optimize: Split into smaller batches to avoid connection pool timeout
        const [totalRevenue, totalOrders, totalCustomers, totalProducts] = await Promise.all([
            // Current period totals
            prisma.order.aggregate({
                where: {
                    createdAt: { gte: startDate },
                    status: "COMPLETED",
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
        const [previousPeriodRevenue, previousPeriodOrders, previousPeriodCustomers,] = await Promise.all([
            // Previous period for comparison
            prisma.order.aggregate({
                where: {
                    createdAt: {
                        gte: new Date(startDate.getTime() - period * 24 * 60 * 60 * 1000),
                        lt: startDate,
                    },
                    status: "COMPLETED",
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
        const revenueGrowth = this.calculateGrowth(previousPeriodRevenue._sum.totalAmount || 0, totalRevenue._sum.totalAmount || 0);
        const ordersGrowth = this.calculateGrowth(previousPeriodOrders, totalOrders);
        const customersGrowth = this.calculateGrowth(previousPeriodCustomers, totalCustomers);
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
    calculateGrowth(previous, current) {
        if (previous === 0)
            return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100 * 100) / 100;
    }
    async getSalesData(period) {
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
                    status: "COMPLETED",
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
    async getTopProducts(period) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - period);
        // ✅ OPTIMIZED: Use single transaction to avoid N+1 queries
        const result = await prisma.$transaction(async (tx) => {
            const topProducts = await tx.orderItem.groupBy({
                by: ["productId"],
                where: {
                    order: {
                        createdAt: { gte: startDate },
                        status: "COMPLETED",
                    },
                },
                _sum: {
                    quantity: true,
                    price: true,
                },
                orderBy: {
                    _sum: {
                        quantity: "desc",
                    },
                },
                take: 5,
            });
            // ✅ OPTIMIZED: Single query for all product details
            const productIds = topProducts.map((item) => item.productId);
            const products = productIds.length > 0
                ? await tx.product.findMany({
                    where: { id: { in: productIds } },
                    select: { id: true, name: true },
                })
                : [];
            // Combine data efficiently
            const productsWithDetails = topProducts.map((item) => {
                const product = products.find((p) => p.id === item.productId);
                return {
                    name: product?.name || "Unknown Product",
                    sales: item._sum.quantity || 0,
                    revenue: (item._sum.price || 0) * (item._sum.quantity || 0),
                };
            });
            return productsWithDetails;
        });
        return result;
    }
    async getRecentOrders() {
        const recentOrders = await prisma.order.findMany({
            where: { status: { in: ["PENDING", "SHIPPED", "COMPLETED"] } },
            include: {
                user: {
                    select: { name: true },
                },
            },
            orderBy: { createdAt: "desc" },
            take: 5,
        });
        return recentOrders.map((order) => ({
            id: order.id,
            customer: order.user.name,
            amount: order.totalAmount,
            status: order.status,
            date: order.createdAt.toISOString().split("T")[0],
        }));
    }
}
exports.AnalyticsService = AnalyticsService;
