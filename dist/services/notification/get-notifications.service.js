"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotificationsService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const getNotificationsService = async (params) => {
    const { userId, page = 1, limit = 10, isRead } = params;
    const filter = {
        userId,
        isDeleted: false,
    };
    if (isRead !== undefined) {
        filter.isRead = isRead;
    }
    const countNotifications = await prisma_1.default.notification.count({ where: filter });
    const totalPages = Math.ceil(countNotifications / limit);
    const notifications = await prisma_1.default.notification.findMany({
        where: filter,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: limit * (page - 1),
    });
    const unreadCount = await prisma_1.default.notification.count({
        where: {
            userId,
            isRead: false,
            isDeleted: false,
        },
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
        unreadCount,
    };
};
exports.getNotificationsService = getNotificationsService;
