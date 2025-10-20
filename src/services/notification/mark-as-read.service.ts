import prisma from "../../prisma";

interface MarkAsReadData {
  userId: string;
  notificationId?: string;
  markAll?: boolean;
}

export const markAsReadService = async (data: MarkAsReadData) => {
  const { userId, notificationId, markAll } = data;

  if (markAll) {
    await prisma.notification.updateMany({
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

  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
      isDeleted: false,
    },
  });

  if (!notification) throw new Error("Notification not found");

  if (notification.isRead) {
    return { message: "Notification is already marked as read" };
  }

  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });

  return { message: "Notification marked as read" };
};
