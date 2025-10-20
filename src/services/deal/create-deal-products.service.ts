import prisma from "../../prisma";

interface CreateDealProductsData {
  dealId: string;
  originalProductIds: string[];
}

export const createDealProductsService = async (
  data: CreateDealProductsData
) => {
  const { dealId, originalProductIds } = data;

  // Get deal information
  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
  });

  if (!deal) {
    throw new Error("Deal not found");
  }

  // Get original products
  const originalProducts = await prisma.product.findMany({
    where: { id: { in: originalProductIds } },
    include: {
      images: true,
      category: true,
    },
  });

  if (originalProducts.length === 0) {
    throw new Error("No products found");
  }

  const dealProducts = [];

  for (const originalProduct of originalProducts) {
    // Check if this product is already in a deal
    const existingDealProduct = await prisma.dealProduct.findFirst({
      where: {
        productId: originalProduct.id,
        deal: {
          status: "ACTIVE",
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
      },
    });

    if (existingDealProduct) {
      throw new Error(
        `Product "${originalProduct.name}" is already in an active deal`
      );
    }

    // Create DealProduct relationship (NO NEW PRODUCT CREATED)
    const dealProductRelation = await prisma.dealProduct.create({
      data: {
        dealId: deal.id,
        productId: originalProduct.id,
      },
    });

    dealProducts.push({
      ...originalProduct,
      dealProductRelation,
    });
  }

  return {
    message: "Deal products created successfully",
    dealProducts,
    dealInfo: {
      dealId: deal.id,
      dealTitle: deal.title,
      originalProductCount: originalProducts.length,
      createdProductCount: dealProducts.length,
    },
  };
};
