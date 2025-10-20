import prisma from "../../prisma";

interface GetUserAddressesParams {
  userId: string;
  page?: number;
  limit?: number;
}

export const getUserAddressesService = async (
  params: GetUserAddressesParams
) => {
  const { userId, page = 1, limit = 10 } = params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) throw new Error("User not found");

  const countAddresses = await prisma.address.count({
    where: { userId },
  });
  const totalPages = Math.ceil(countAddresses / limit);

  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: limit * (page - 1),
  });

  return {
    addresses,
    pagination: {
      page,
      limit,
      totalItems: countAddresses,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};
