import prisma from "../../prisma";
import { getMultipleProductsPriceWithDeals } from "../deal/get-product-price-with-deal.service";

interface GetCartData {
  userId: string;
}

export const getCartService = async (data: GetCartData) => {
  const { userId } = data;

  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) throw new Error("User not found");

  // Get user's cart with items
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: true,
              category: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!cart) {
    // Create empty cart if doesn't exist
    const newCart = await prisma.cart.create({
      data: {
        userId,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                category: true,
              },
            },
          },
        },
      },
    });

    return {
      cart: newCart,
      totalItems: 0,
      totalAmount: 0,
    };
  }

  // Calculate totals with deal pricing
  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  // Get product prices with deals
  const productIds = cart.items.map((item) => item.productId);
  const productPrices = await getMultipleProductsPriceWithDeals(productIds);

  // Create a map for quick lookup
  const priceMap = new Map(
    productPrices.map((price) => [price.productId, price])
  );

  // Calculate total amount using deal prices
  const totalAmount = cart.items.reduce((sum, item) => {
    const priceInfo = priceMap.get(item.productId);
    const price = priceInfo ? priceInfo.discountedPrice : item.product.price;
    return sum + price * item.quantity;
  }, 0);

  // Add deal information to cart items
  const cartItemsWithDeals = cart.items.map((item) => {
    const priceInfo = priceMap.get(item.productId);
    return {
      ...item,
      product: {
        ...item.product,
        deal: priceInfo
          ? {
              id: priceInfo.dealId,
              title: priceInfo.dealTitle,
              originalPrice: priceInfo.originalPrice,
              discountedPrice: priceInfo.discountedPrice,
              discountAmount: priceInfo.discountAmount,
              discountPercentage: priceInfo.discountPercentage,
              isFlashSale: priceInfo.isFlashSale,
              endDate: priceInfo.dealEndDate,
            }
          : null,
      },
    };
  });

  return {
    cart: {
      ...cart,
      items: cartItemsWithDeals,
    },
    totalItems,
    totalAmount: Math.round(totalAmount * 100) / 100, // Round to 2 decimal places
  };
};
