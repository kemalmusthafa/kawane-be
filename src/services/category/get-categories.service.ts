import prisma from "../../prisma";

interface GetCategoriesParams {
  page?: number;
  limit?: number;
  includeProducts?: boolean;
}

export const getCategoriesService = async (
  params: GetCategoriesParams = {}
) => {
  const { page = 1, limit = 10, includeProducts = false } = params;

  const countCategories = await prisma.category.count();
  const totalPages = Math.ceil(countCategories / limit);

  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          products: true,
        },
      },
      ...(includeProducts && {
        products: {
          include: {
            images: true,
          },
          take: 5,
        },
      }),
    },
    orderBy: { name: "asc" },
    take: limit,
    skip: limit * (page - 1),
  });

  return {
    categories,
    pagination: {
      page,
      limit,
      totalItems: countCategories,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};
