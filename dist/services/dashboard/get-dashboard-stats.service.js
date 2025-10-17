"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStatsService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const getDashboardStatsService = async (params = {}) => {
    const { startDate, endDate } = params;
    const dateFilter = {};
    if (startDate || endDate) {
        dateFilter.createdAt = {};
        if (startDate)
            dateFilter.createdAt.gte = startDate;
        if (endDate)
            dateFilter.createdAt.lte = endDate;
    }
    try {
        // ✅ OPTIMIZED: Use single transaction with optimized queries
        const result = await prisma_1.default.$transaction(async (tx) => {
            // Batch 1: Core statistics with optimized queries
            const [userStats, productStats, orderStats] = await Promise.all([
                // User count with date filter
                tx.user.count({
                    where: {
                        ...dateFilter,
                        role: "CUSTOMER",
                    },
                }),
                // Product count with low stock check
                tx.product.aggregate({
                    _count: { id: true },
                    _min: { stock: true },
                }),
                // Order statistics with aggregation
                tx.order.aggregate({
                    where: dateFilter,
                    _count: { id: true },
                    _sum: { totalAmount: true },
                }),
            ]);
            // Batch 2: Order status counts and recent orders
            const [orderStatusCounts, recentOrders] = await Promise.all([
                // Get order counts by status in single query
                tx.order.groupBy({
                    by: ["status"],
                    where: dateFilter,
                    _count: { status: true },
                }),
                // Recent orders with optimized includes
                tx.order.findMany({
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
                                        images: true,
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
            ]);
            // Batch 3: Top products with optimized query (avoid N+1)
            const topProductsData = await tx.orderItem.groupBy({
                by: ["productId"],
                where: {
                    order: dateFilter,
                },
                _sum: {
                    quantity: true,
                },
                orderBy: {
                    _sum: {
                        quantity: "desc",
                    },
                },
                take: 5,
            });
            // Get product details for top products in single query
            const productIds = topProductsData.map((item) => item.productId);
            const topProductsWithDetails = productIds.length > 0
                ? await tx.product.findMany({
                    where: {
                        id: { in: productIds },
                    },
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        images: true,
                    },
                })
                : [];
            // Combine top products data
            const topProducts = topProductsData.map((item) => {
                const product = topProductsWithDetails.find((p) => p.id === item.productId);
                return {
                    ...product,
                    totalSold: item._sum.quantity || 0,
                };
            });
            // Calculate low stock products count
            const lowStockProducts = await tx.product.count({
                where: {
                    stock: {
                        lte: 10,
                    },
                },
            });
            // Process order status counts
            const pendingOrders = orderStatusCounts.find((item) => item.status === "PENDING")?._count
                .status || 0;
            const completedOrders = orderStatusCounts.find((item) => item.status === "COMPLETED")?._count
                .status || 0;
            return {
                overview: {
                    totalUsers: userStats,
                    totalProducts: productStats._count.id,
                    totalOrders: orderStats._count.id,
                    totalRevenue: orderStats._sum.totalAmount || 0,
                    pendingOrders,
                    lowStockProducts,
                },
                recentOrders: recentOrders.map((order) => ({
                    ...order,
                    paymentStatus: order.payment?.status || "PENDING",
                })),
                topProducts,
            };
        });
        return result;
    }
    catch (error) {
        console.error("Error in getDashboardStatsService:", error);
        throw new Error("Failed to fetch dashboard statistics");
    }
};
exports.getDashboardStatsService = getDashboardStatsService;
