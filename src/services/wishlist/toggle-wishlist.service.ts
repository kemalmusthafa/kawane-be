import prisma from "../../prisma";

interface ToggleWishlistData {
  userId: string;
  productId: string;
}

export const toggleWishlistService = async (data: ToggleWishlistData) => {
  const user = await prisma.user.findUnique({
    where: { id: data.userId },
  });
  if (!user) throw new Error("User not found");

  const product = await prisma.product.findUnique({
    where: { id: data.productId },
  });
  if (!product) throw new Error("Product not found");

  const existingWishlist = await prisma.wishlist.findFirst({
    where: {
      userId: data.userId,
      productId: data.productId,
    },
  });

  if (existingWishlist) {
    await prisma.wishlist.delete({
      where: { id: existingWishlist.id },
    });
    return { action: "removed", message: "Product removed from wishlist" };
  } else {
    await prisma.wishlist.create({
      data: {
        userId: data.userId,
        productId: data.productId,
      },
    });
    return { action: "added", message: "Product added to wishlist" };
  }
};
