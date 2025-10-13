"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsReadService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const markAsReadService = async (data) => {
    const { userId, notificationId, markAll } = data;
    if (markAll) {
        await prisma_1.default.notification.updateMany({
            where: {
                userId,
                isRead: false,
                isDeleted: false,
            },
            data: { isRead: true },
        });
        return { message: "All notifications marked as read" };
    }
    if (!notificationId) {
        throw new Error("Notification ID is required when not marking all as read");
    }
    const notification = await prisma_1.default.notification.findFirst({
        where: {
            id: notificationId,
            userId,
            isDeleted: false,
        },
    });
    if (!notification)
        throw new Error("Notification not found");
    if (notification.isRead) {
        return { message: "Notification is already marked as read" };
    }
    await prisma_1.default.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
    });
    return { message: "Notification marked as read" };
};
exports.markAsReadService = markAsReadService;
