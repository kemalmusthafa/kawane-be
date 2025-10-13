"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderDetailService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const getOrderDetailService = async (params) => {
    const { orderId, userId } = params;
    // First check if user exists
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!user)
        throw new Error("User not found");
    // Get order with all related data
    const order = await prisma_1.default.order.findUnique({
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
    if (!order)
        throw new Error("Order not found");
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
exports.getOrderDetailService = getOrderDetailService;
