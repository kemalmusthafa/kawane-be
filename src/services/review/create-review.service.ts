import prisma from "../../prisma";

interface CreateReviewData {
  userId: string;
  productId: string;
  rating: number;
  comment?: string;
}

export const createReviewService = async (data: CreateReviewData) => {
  if (data.rating < 1 || data.rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  const user = await prisma.user.findUnique({
    where: { id: data.userId },
  });
  if (!user) throw new Error("User not found");

  const product = await prisma.product.findUnique({
    where: { id: data.productId },
  });
  if (!product) throw new Error("Product not found");

  const existingReview = await prisma.review.findFirst({
    where: {
      userId: data.userId,
      productId: data.productId,
    },
  });

  const hasPurchased = await prisma.orderItem.findFirst({
    where: {
      productId: data.productId,
      order: {
        userId: data.userId,
        status: {
          in: ["COMPLETED", "PAID", "SHIPPED"],
        },
      },
    },
  });

  if (!hasPurchased)
    throw new Error(
      "You can only review products you have purchased (order must be PAID, SHIPPED, or COMPLETED)"
    );

  let review;

  if (existingReview) {
    // Update existing review
    review = await prisma.review.update({
      where: {
        id: existingReview.id,
      },
      data: {
        rating: data.rating,
        comment: data.comment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  } else {
    // Create new review
    review = await prisma.review.create({
      data: {
        userId: data.userId,
        productId: data.productId,
        rating: data.rating,
        comment: data.comment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  // Calculate and update product average rating
  const allReviews = await prisma.review.findMany({
    where: { productId: data.productId },
  });

  const avgRating =
    allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0;

  // Note: avgRating is calculated on-the-fly in get-product-detail service
  // This ensures it's always accurate without needing to update product table

  return review;
};
