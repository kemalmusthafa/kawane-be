import prisma from "../../prisma";
import { Prisma } from "../../../prisma/generated/client";

// Type untuk query parameters yang sudah di-validate oleh Zod middleware
type GetUserQuery = {
  search?: string;
  page?: number;
  limit?: number;
};

export const getUserService = async (query: GetUserQuery) => {
  const { search, page = 1, limit = 10 } = query;

  const filter: Prisma.UserWhereInput = {
    isDeleted: false, // Only show active users
  };

  if (search) {
    filter.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const countUser = await prisma.user.count({ where: filter });
  const total_page = Math.ceil(countUser / limit);

  const users = await prisma.user.findMany({
    where: filter,
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: limit * (page - 1),
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      role: true,
      isVerified: true,
      isDeleted: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    total_page,
    page,
    limit,
    total_users: countUser,
    users,
  };
};
