import prisma from "../../prisma";

interface DeleteProductData {
  id: string;
}

export const deleteProductService = async (data: DeleteProductData) => {
  const product = await prisma.product.findUnique({
    where: { id: data.id },
    include: {
      _count: {
        select: {
          orderItems: true,
          cartItems: true,
          wishlist: true,
          reviews: true,
        },
      },
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  // Check if product has any dependencies
  const hasDependencies =
    product._count.orderItems > 0 ||
    product._count.cartItems > 0 ||
    product._count.wishlist > 0 ||
    product._count.reviews > 0;

  if (hasDependencies) {
    throw new Error(
      "Cannot delete product that has orders, cart items, wishlist entries, or reviews. " +
        "Please handle these dependencies first or consider archiving the product instead."
    );
  }

  // Delete product images first
  await prisma.productImage.deleteMany({
    where: { productId: data.id },
  });

  // Delete inventory logs
  await prisma.inventoryLog.deleteMany({
    where: { productId: data.id },
  });

  // Delete the product
  await prisma.product.delete({
    where: { id: data.id },
  });

  return { message: "Product deleted successfully" };
};
