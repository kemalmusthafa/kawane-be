"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShipmentByTrackingService = exports.getShipmentByIdService = exports.getShipmentsService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const getShipmentsService = async (input) => {
    try {
        const { userId, orderId, status, carrier, page = 1, limit = 10, startDate, endDate, } = input;
        const skip = (page - 1) * limit;
        // Build where clause
        const where = {};
        if (userId) {
            where.order = {
                userId: userId,
            };
        }
        if (orderId) {
            where.orderId = orderId;
        }
        if (carrier) {
            where.courier = {
                contains: carrier,
            };
        }
        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            };
        }
        else if (startDate) {
            where.createdAt = {
                gte: new Date(startDate),
            };
        }
        else if (endDate) {
            where.createdAt = {
                lte: new Date(endDate),
            };
        }
        // Get shipments with pagination
        const [shipments, total] = await Promise.all([
            prisma_1.default.shipment.findMany({
                where,
                include: {
                    order: {
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
                                        select: {
                                            id: true,
                                            name: true,
                                            sku: true,
                                            price: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma_1.default.shipment.count({ where }),
        ]);
        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;
        return {
            shipments: shipments.map((shipment) => ({
                id: shipment.id,
                orderId: shipment.orderId,
                trackingNumber: shipment.trackingNo,
                carrier: shipment.courier,
                cost: shipment.cost,
                estimatedDays: shipment.estimatedDays,
                createdAt: shipment.createdAt,
                order: {
                    id: shipment.order.id,
                    status: shipment.order.status,
                    totalAmount: shipment.order.totalAmount,
                    user: shipment.order.user,
                    items: shipment.order.items,
                },
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage,
                hasPrevPage,
            },
        };
    }
    catch (error) {
        console.error("❌ Get shipments failed:", error);
        throw new Error("Failed to get shipments");
    }
};
exports.getShipmentsService = getShipmentsService;
// Get single shipment by ID
const getShipmentByIdService = async (shipmentId) => {
    try {
        const shipment = await prisma_1.default.shipment.findUnique({
            where: { id: shipmentId },
            include: {
                order: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                            },
                        },
                        items: {
                            include: {
                                product: {
                                    select: {
                                        id: true,
                                        name: true,
                                        sku: true,
                                        price: true,
                                        images: {
                                            select: {
                                                url: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!shipment) {
            throw new Error("Shipment not found");
        }
        return {
            shipment: {
                id: shipment.id,
                orderId: shipment.orderId,
                trackingNumber: shipment.trackingNo,
                carrier: shipment.courier,
                cost: shipment.cost,
                estimatedDays: shipment.estimatedDays,
                createdAt: shipment.createdAt,
                order: {
                    id: shipment.order.id,
                    status: shipment.order.status,
                    totalAmount: shipment.order.totalAmount,
                    user: shipment.order.user,
                    items: shipment.order.items,
                },
            },
        };
    }
    catch (error) {
        console.error("❌ Get shipment by ID failed:", error);
        throw new Error(error.message || "Failed to get shipment");
    }
};
exports.getShipmentByIdService = getShipmentByIdService;
// Get shipment by tracking number
const getShipmentByTrackingService = async (trackingNumber) => {
    try {
        const shipment = await prisma_1.default.shipment.findFirst({
            where: { trackingNo: trackingNumber },
            include: {
                order: {
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
                                    select: {
                                        id: true,
                                        name: true,
                                        sku: true,
                                        price: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!shipment) {
            throw new Error("Shipment not found");
        }
        return {
            shipment: {
                id: shipment.id,
                orderId: shipment.orderId,
                trackingNumber: shipment.trackingNo,
                carrier: shipment.courier,
                cost: shipment.cost,
                estimatedDays: shipment.estimatedDays,
                createdAt: shipment.createdAt,
                order: {
                    id: shipment.order.id,
                    status: shipment.order.status,
                    totalAmount: shipment.order.totalAmount,
                    user: shipment.order.user,
                    items: shipment.order.items,
                },
            },
        };
    }
    catch (error) {
        console.error("❌ Get shipment by tracking failed:", error);
        throw new Error(error.message || "Failed to get shipment");
    }
};
exports.getShipmentByTrackingService = getShipmentByTrackingService;
