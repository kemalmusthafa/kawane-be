import prisma from "../../prisma";

interface GetNotificationsParams {
  userId: string;
  page?: number;
  limit?: number;
  isRead?: boolean;
}

export const getNotificationsService = async (
  params: GetNotificationsParams
) => {
  const { userId, page = 1, limit = 10, isRead } = params;

  const filter: any = {
    userId,
    isDeleted: false,
  };

  if (isRead !== undefined) {
    filter.isRead = isRead;
  }

  const countNotifications = await prisma.notification.count({ where: filter });
  const totalPages = Math.ceil(countNotifications / limit);

  const notifications = await prisma.notification.findMany({
    where: filter,
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: limit * (page - 1),
  });

  const unreadCount = await prisma.notification.count({
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
