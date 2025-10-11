import prisma from "../../prisma";
import { Prisma } from "../../../prisma/generated/client";

interface GetAdminNotificationsParams {
  search?: string;
  page?: number;
  limit?: number;
  isRead?: boolean;
}

export const getAdminNotificationsService = async (
  params: GetAdminNotificationsParams
) => {
  const { search, page = 1, limit = 10, isRead } = params;

  const filter: Prisma.NotificationWhereInput = {
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

  const countNotifications = await prisma.notification.count({ where: filter });
  const totalPages = Math.ceil(countNotifications / limit);

  const notifications = await prisma.notification.findMany({
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
