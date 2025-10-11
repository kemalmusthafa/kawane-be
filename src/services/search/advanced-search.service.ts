import prisma from "../../prisma";

interface AdvancedSearchParams {
  query?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  hasReviews?: boolean;
  minRating?: number;
  sortBy?: "name" | "price" | "createdAt" | "rating";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export const advancedSearchService = async (
  params: AdvancedSearchParams = {}
) => {
  const {
    query,
    categoryId,
    minPrice,
    maxPrice,
    inStock,
    hasReviews,
    minRating,
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = params;

  const filter: any = {};

  if (query) {
    filter.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { sku: { contains: query, mode: "insensitive" } },
    ];
  }

  if (categoryId) {
    filter.categoryId = categoryId;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.gte = minPrice;
    if (maxPrice !== undefined) filter.price.lte = maxPrice;
  }

  if (inStock !== undefined) {
    if (inStock) {
      filter.stock = { gt: 0 };
    } else {
      filter.stock = { lte: 0 };
    }
  }

  if (hasReviews) {
    filter.reviews = {
      some: {},
    };
  }

  if (minRating) {
    filter.reviews = {
      some: {
        rating: {
          gte: minRating,
        },
      },
    };
  }

  const countProducts = await prisma.product.count({ where: filter });
  const totalPages = Math.ceil(countProducts / limit);

  let orderBy: any = {};
  if (sortBy === "rating") {
    orderBy.reviews = {
      _avg: {
        rating: sortOrder,
      },
    };
  } else {
    orderBy[sortBy] = sortOrder;
  }

  const products = await prisma.product.findMany({
    where: filter,
    include: {
      category: true,
      images: true,
      _count: {
        select: {
          reviews: true,
          wishlist: true,
        },
      },
      reviews: {
        select: {
          rating: true,
        },
      },
    },
    orderBy,
    take: limit,
    skip: limit * (page - 1),
  });

  const productsWithAvgRating = products.map((product) => {
    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
          product.reviews.length
        : 0;

    return {
      ...product,
      avgRating: Math.round(avgRating * 10) / 10,
      reviews: undefined,
    };
  });

  return {
    products: productsWithAvgRating,
    pagination: {
      page,
      limit,
      totalItems: countProducts,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
    filters: {
      query,
      categoryId,
      minPrice,
      maxPrice,
      inStock,
      hasReviews,
      minRating,
    },
  };
};
