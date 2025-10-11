import prisma from "../../prisma";
import { DealStatus } from "../../../prisma/generated/client";

interface GetDealsParams {
  status?: DealStatus;
  isFlashSale?: boolean;
  page?: number;
  limit?: number;
  includeExpired?: boolean;
}

export const getDealsService = async (params: GetDealsParams = {}) => {
  const {
    status,
    isFlashSale,
    page = 1,
    limit = 10,
    includeExpired = false,
  } = params;

  const filter: any = {};

  if (status) {
    filter.status = status;
  }

  if (isFlashSale !== undefined) {
    filter.isFlashSale = isFlashSale;
  }

  if (!includeExpired) {
    filter.OR = [
      { status: { not: "EXPIRED" } },
      {
        AND: [{ status: "ACTIVE" }, { endDate: { gte: new Date() } }],
      },
    ];
  }

  const count = await prisma.deal.count({ where: filter });
  const totalPages = Math.ceil(count / limit);

  const deals = await prisma.deal.findMany({
    where: filter,
    include: {
      images: true,
      dealProducts: {
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
    orderBy: [{ isFlashSale: "desc" }, { startDate: "desc" }],
    take: limit,
    skip: limit * (page - 1),
  });

  // Calculate discounted prices for each product
  const dealsWithDiscountedPrices = deals.map((deal) => ({
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
  }));

  return {
    deals: dealsWithDiscountedPrices,
    pagination: {
      page,
      limit,
      totalItems: count,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};
