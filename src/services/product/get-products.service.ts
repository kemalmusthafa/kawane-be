import prisma from "../../prisma";
import { Prisma } from "../../../prisma/generated/client";

export interface GetProductsParams {
  search?: string;
  categoryId?: string;
  status?: string;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: "name" | "price" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export const getProductsService = async (params: GetProductsParams = {}) => {
  const {
    search,
    categoryId,
    status,
    inStock,
    minPrice,
    maxPrice,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = params;

  const filter: Prisma.ProductWhereInput = {};

  if (search) {
    filter.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ];
  }

  if (categoryId) {
    filter.categoryId = categoryId;
  }

  // Handle status filtering based on stock
  if (status) {
    switch (status.toLowerCase()) {
      case "active":
        filter.stock = { gt: 0 };
        break;
      case "out_of_stock":
        filter.stock = { lte: 0 };
        break;
      case "inactive":
        // For inactive, we'll treat it as out of stock
        filter.stock = { lte: 0 };
        break;
    }
  }

  // Handle inStock filtering (boolean)
  if (inStock !== undefined) {
    if (inStock) {
      filter.stock = { gt: 0 };
    } else {
      filter.stock = { lte: 0 };
    }
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.gte = minPrice;
    if (maxPrice !== undefined) filter.price.lte = maxPrice;
  }

  const countProducts = await prisma.product.count({ where: filter });
  const totalPages = Math.ceil(countProducts / limit);

  const products = await prisma.product.findMany({
    where: filter,
    include: {
      category: true,
      images: true,
      reviews: {
        select: {
          rating: true,
        },
      },
      dealProducts: {
        include: {
          deal: true,
        },
        where: {
          deal: {
            status: "ACTIVE",
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
        },
      },
      _count: {
        select: {
          reviews: true,
          wishlist: true,
        },
      },
    },
    orderBy: { [sortBy]: sortOrder },
    take: limit,
    skip: limit * (page - 1),
  });

  // Calculate average rating and deal information for each product
  const productsWithRating = products.map((product) => {
    const averageRating =
      product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
          product.reviews.length
        : 0;

    // Get active deal for this product
    const activeDeal = product.dealProducts.find((dp) => dp.deal)?.deal;
    let dealInfo = null;

    if (activeDeal) {
      let discountedPrice = product.price;
      let discountAmount = 0;
      let discountPercentage = 0;

      if (activeDeal.type === "PERCENTAGE") {
        discountAmount = (product.price * activeDeal.value) / 100;
        discountedPrice = product.price - discountAmount;
        discountPercentage = activeDeal.value;
      } else if (activeDeal.type === "FIXED_AMOUNT") {
        discountAmount = activeDeal.value;
        discountedPrice = Math.max(0, product.price - activeDeal.value);
        discountPercentage = Math.round((discountAmount / product.price) * 100);
      } else if (activeDeal.type === "FLASH_SALE") {
        discountedPrice = activeDeal.value;
        discountAmount = product.price - activeDeal.value;
        discountPercentage = Math.round((discountAmount / product.price) * 100);
      }

      dealInfo = {
        id: activeDeal.id,
        title: activeDeal.title,
        type: activeDeal.type,
        value: activeDeal.value,
        isFlashSale: activeDeal.isFlashSale,
        originalPrice: product.price,
        discountedPrice: Math.round(discountedPrice * 100) / 100,
        discountAmount: Math.round(discountAmount * 100) / 100,
        discountPercentage,
        endDate: activeDeal.endDate,
      };
    }

    return {
      ...product,
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      reviews: undefined, // Remove reviews array to avoid duplication
      dealProducts: undefined, // Remove dealProducts array to avoid duplication
      deal: dealInfo,
    };
  });

  return {
    products: productsWithRating,
    pagination: {
      page,
      limit,
      totalItems: countProducts,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};
