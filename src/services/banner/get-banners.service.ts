import prisma from "../../prisma";

interface GetBannersParams {
  isActive?: boolean;
  includeInactive?: boolean;
}

export const getBannersService = async (
  params: GetBannersParams = {}
) => {
  const { isActive, includeInactive = false } = params;

  const where: any = {};
  
  // Filter by active status if specified
  if (isActive !== undefined) {
    where.isActive = isActive;
  } else if (!includeInactive) {
    // Default: only show active banners
    where.isActive = true;
  }

  const banners = await prisma.banner.findMany({
    where,
    orderBy: [
      { priority: "asc" },
      { createdAt: "desc" },
    ],
  });

  return banners;
};

