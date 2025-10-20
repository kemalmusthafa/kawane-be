"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminNotificationsService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const getAdminNotificationsService = async (params) => {
    const { search, page = 1, limit = 10, isRead } = params;
    const filter = {
        isDeleted: false,
    };
    // Add search functionality
    if (search) {
        filter.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
        ];
    }
    if (isRead !== undefined) {
        filter.isRead = isRead;
    }
    const countNotifications = await prisma_1.default.notification.count({ where: filter });
    const totalPages = Math.ceil(countNotifications / limit);
    const notifications = await prisma_1.default.notification.findMany({
        where: filter,
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: limit * (page - 1),
    });
    return {
        notifications,
        pagination: {
            page,
            limit,
            totalItems: countNotifications,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        },
    };
};
exports.getAdminNotificationsService = getAdminNotificationsService;
