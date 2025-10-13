"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserOrdersService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const getUserOrdersService = async (params) => {
    const { userId, status, page = 1, limit = 10 } = params;
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!user)
        throw new Error("User not found");
    const filter = { userId };
    if (status)
        filter.status = status;
    const countOrders = await prisma_1.default.order.count({ where: filter });
    const totalPages = Math.ceil(countOrders / limit);
    const orders = await prisma_1.default.order.findMany({
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
exports.getUserOrdersService = getUserOrdersService;
