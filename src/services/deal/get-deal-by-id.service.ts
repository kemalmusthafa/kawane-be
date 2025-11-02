import prisma from "../../prisma";

interface GetDealByIdParams {
  id: string;
}

export const getDealByIdService = async (params: GetDealByIdParams) => {
  const { id } = params;

  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      images: true,
      dealProducts: {
        include: {
          product: {
            include: {
              images: true,
              category: true,
              sizes: true,
            },
          },
        },
      },
    },
  });

  if (!deal) {
    throw new Error("Deal not found");
  }

  // Calculate discounted prices for each product
  const dealWithDiscountedPrices = {
    ...deal,
    dealProducts: deal.dealProducts.map((dealProduct) => {
      const product = dealProduct.product;
      let discountedPrice = product.price;

      if (deal.type === "PERCENTAGE") {
        discountedPrice = product.price * (1 - deal.value / 100);
      } else if (deal.type === "FIXED_AMOUNT") {
        discountedPrice = Math.max(0, product.price - deal.value);
      }

      return {
        ...dealProduct,
        product: {
          ...product,
          originalPrice: product.price,
          discountedPrice: Math.round(discountedPrice * 100) / 100,
          discountAmount: product.price - discountedPrice,
          discountPercentage: Math.round(
            ((product.price - discountedPrice) / product.price) * 100
          ),
        },
      };
    }),
  };

  return {
    success: true,
    message: "Deal retrieved successfully",
    data: dealWithDiscountedPrices,
  };
};
