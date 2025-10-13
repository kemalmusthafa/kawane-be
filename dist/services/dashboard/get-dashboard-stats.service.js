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
    const [totalUsers, totalProducts, totalOrders, totalRevenue, pendingOrders, lowStockProducts, recentOrders, topProducts,] = await Promise.all([
        prisma_1.default.user.count({
            where: {
                ...dateFilter,
                role: "CUSTOMER",
            },
        }),
        prisma_1.default.product.count(),
        prisma_1.default.order.count({ where: dateFilter }),
        prisma_1.default.order.aggregate({
            where: {
                ...dateFilter,
                status: "COMPLETED",
            },
            _sum: {
                totalAmount: true,
            },
        }),
        prisma_1.default.order.count({
            where: {
                ...dateFilter,
                status: "PENDING",
            },
        }),
        prisma_1.default.product.count({
            where: {
                stock: {
                    lte: 10,
                },
            },
        }),
        prisma_1.default.order.findMany({
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
        prisma_1.default.orderItem.groupBy({
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
    const topProductsWithDetails = await Promise.all(topProducts.map(async (item) => {
        const product = await prisma_1.default.product.findUnique({
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
    }));
    const monthlyRevenue = await prisma_1.default.order.groupBy({
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
exports.getDashboardStatsService = getDashboardStatsService;
