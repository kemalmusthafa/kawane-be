import prisma from "../../prisma";

interface ClearCartData {
  userId: string;
}

export const clearCartService = async (data: ClearCartData) => {
  const { userId } = data;

  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) throw new Error("User not found");

  // Get user's cart
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: true,
    },
  });

  if (!cart) {
    return {
      message: "Cart is already empty",
      clearedItems: 0,
    };
  }

  // Count items before clearing
  const itemCount = cart.items.length;

  // Clear all cart items
  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  return {
    message: "Cart cleared successfully",
    clearedItems: itemCount,
  };
};
