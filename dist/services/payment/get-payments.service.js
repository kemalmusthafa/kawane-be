"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentsService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const getPaymentsService = async (params = {}) => {
    const { userId, orderId, status, page = 1, limit = 10, startDate, endDate, } = params;
    const filter = {};
    if (userId) {
        filter.order = {
            userId,
        };
    }
    if (orderId) {
        filter.orderId = orderId;
    }
    if (status) {
        filter.status = status;
    }
    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) {
            filter.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
            filter.createdAt.lte = new Date(endDate);
        }
    }
    const countPayments = await prisma_1.default.payment.count({
        where: filter,
    });
    const totalPages = Math.ceil(countPayments / limit);
    const payments = await prisma_1.default.payment.findMany({
        where: filter,
        include: {
            order: {
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
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        take: limit,
        skip: limit * (page - 1),
    });
    return {
        payments,
        pagination: {
            page,
            limit,
            totalItems: countPayments,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        },
    };
};
exports.getPaymentsService = getPaymentsService;
