import prisma from "../../prisma";

interface GetWishlistData {
  userId: string;
}

export const getWishlistService = async (data: GetWishlistData) => {
  const { userId } = data;

  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) throw new Error("User not found");

  // Get user's wishlist with products
  const wishlist = await prisma.wishlist.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          images: true,
          category: true,
          _count: {
            select: {
              reviews: true,
              wishlist: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    wishlist,
    totalItems: wishlist.length,
  };
};
