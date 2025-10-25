import prisma from "../../prisma";

export interface BestSellerProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  sku: string | null;
  stock: number;
  status: string;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    name: string;
    description: string | null;
    image: string | null;
  } | null;
  images: Array<{
    id: string;
    url: string;
    productId: string;
  }>;
  _count: {
    reviews: number;
    wishlist: number;
  };
  rating: number;
  deal: any;
  // Best seller specific fields
  totalSold: number;
  totalRevenue: number;
  averageRating: number;
  reviewCount: number;
  bestSellerScore: number;
}

export interface GetBestSellersParams {
  limit?: number;
  categoryId?: string;
  timeRange?: "week" | "month" | "quarter" | "year" | "all";
}

export const getBestSellersService = async (
  params: GetBestSellersParams = {}
) => {
  const { limit = 4, categoryId, timeRange = "month" } = params;

  // Calculate date range based on timeRange
  const now = new Date();
  let startDate: Date;

  switch (timeRange) {
    case "week":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "month":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "quarter":
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case "year":
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    case "all":
    default:
      startDate = new Date(0); // All time
      break;
  }

  // Base filter for products
  const baseFilter: any = {
    status: "ACTIVE",
    stock: { gt: 0 },
    // Exclude deal-specific products
    AND: [
      {
        OR: [{ sku: null }, { NOT: { sku: { startsWith: "DEAL-" } } }],
      },
      {
        OR: [
          { description: null },
          { description: "" },
          { NOT: { description: { contains: "DEAL SPECIAL" } } },
        ],
      },
      {
        OR: [
          { description: null },
          { description: "" },
          { NOT: { description: { contains: "🎉" } } },
        ],
      },
      {
        OR: [
          { description: null },
          { description: "" },
          { NOT: { description: { contains: "💰" } } },
        ],
      },
      {
        OR: [
          { description: null },
          { description: "" },
          { NOT: { description: { contains: "🔥" } } },
        ],
      },
      {
        OR: [
          { description: null },
          { description: "" },
          { NOT: { description: { contains: "💸" } } },
        ],
      },
    ],
  };

  if (categoryId) {
    baseFilter.categoryId = categoryId;
  }

  // Get all products with their sales data
  const products = await prisma.product.findMany({
    where: baseFilter,
    include: {
      category: true,
      images: true,
      reviews: {
        select: {
          rating: true,
          createdAt: true,
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
  });

  // Calculate best seller metrics for each product
  const productsWithMetrics: BestSellerProduct[] = [];

  for (const product of products) {
    // Get order items for this product within the time range - only from PAID orders
    const orderItems = await prisma.orderItem.findMany({
      where: {
        productId: product.id,
        order: {
          payment: {
            status: "SUCCEEDED",
          },
          createdAt: { gte: startDate },
        },
      },
      include: {
        order: {
          select: {
            createdAt: true,
            status: true,
          },
        },
      },
    });

    // Calculate metrics
    const totalSold = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalRevenue = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Calculate average rating from reviews
    const reviews = product.reviews.filter(
      (review) => review.createdAt >= startDate
    );
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        : 0;

    const reviewCount = reviews.length;

    // Calculate best seller score
    // Formula: (totalSold * 0.4) + (averageRating * 10 * 0.3) + (reviewCount * 0.2) + (totalRevenue / 100000 * 0.1)
    const bestSellerScore =
      totalSold * 0.4 +
      averageRating * 10 * 0.3 +
      reviewCount * 0.2 +
      (totalRevenue / 100000) * 0.1;

    // Calculate deal information
    const activeDeal = product.dealProducts.find((dp) => dp.deal)?.deal;
    let deal = null;

    // Check if product is already discounted (has DEAL- prefix in SKU or DEAL SPECIAL in description)
    const isAlreadyDiscounted =
      product.sku?.startsWith("DEAL-") ||
      product.description?.includes("DEAL SPECIAL");

    if (isAlreadyDiscounted) {
      // For products already discounted, calculate original price and discount info
      const discountPercentage = 10; // This should come from deal info or be configurable
      const originalPrice = Math.round(
        product.price / (1 - discountPercentage / 100)
      );
      const discountAmount = originalPrice - product.price;

      deal = {
        id: "pre-discounted",
        title: "Deal Special",
        originalPrice: originalPrice,
        discountedPrice: product.price,
        discountAmount: discountAmount,
        discountPercentage: discountPercentage,
        isFlashSale: false,
        endDate: new Date(),
      };
    } else if (activeDeal) {
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

      deal = {
        id: activeDeal.id,
        title: activeDeal.title,
        originalPrice: product.price,
        discountedPrice,
        discountAmount,
        discountPercentage,
        isFlashSale: activeDeal.isFlashSale,
        endDate: activeDeal.endDate,
      };
    }

    productsWithMetrics.push({
      ...product,
      rating: Math.round(averageRating * 10) / 10,
      deal,
      totalSold,
      totalRevenue,
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount,
      bestSellerScore,
    });
  }

  // Sort by best seller score (descending)
  const sortedProducts = productsWithMetrics.sort(
    (a, b) => b.bestSellerScore - a.bestSellerScore
  );

  // Take only the requested limit
  const bestSellers = sortedProducts.slice(0, limit);

  return {
    success: true,
    message: "Best sellers retrieved successfully",
    data: {
      bestSellers,
      timeRange,
      totalProducts: products.length,
      metrics: {
        averageScore:
          bestSellers.reduce((sum, p) => sum + p.bestSellerScore, 0) /
          bestSellers.length,
        totalSold: bestSellers.reduce((sum, p) => sum + p.totalSold, 0),
        totalRevenue: bestSellers.reduce((sum, p) => sum + p.totalRevenue, 0),
      },
    },
  };
};
