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
    // Calculate discounted price
    let discountedPrice = originalProduct.price;
    let discountAmount = 0;

    if (deal.type === "PERCENTAGE") {
      discountAmount = (originalProduct.price * deal.value) / 100;
      discountedPrice = originalProduct.price - discountAmount;
    } else if (deal.type === "FIXED_AMOUNT") {
      discountAmount = deal.value;
      discountedPrice = Math.max(0, originalProduct.price - deal.value);
    } else if (deal.type === "FLASH_SALE") {
      discountedPrice = deal.value;
      discountAmount = originalProduct.price - deal.value;
    }

    // Create new product for deal
    const dealProduct = await prisma.product.create({
      data: {
        name: `${deal.title} (Deal)`,
        description: `🎉 DEAL SPECIAL: ${
          deal.title
        }\n💰 Original Price: Rp ${originalProduct.price.toLocaleString()}\n🔥 Deal Price: Rp ${discountedPrice.toLocaleString()}\n💸 You Save: Rp ${discountAmount.toLocaleString()}\n\n${
          originalProduct.description
        }`,
        price: discountedPrice,
        stock: originalProduct.stock,
        sku: `DEAL-${originalProduct.sku}-${deal.id.slice(-8)}`,
        categoryId: originalProduct.categoryId,
        status: "ACTIVE",
        // Copy images from original product
        images: {
          create: originalProduct.images.map((img) => ({
            url: img.url,
          })),
        },
      },
      include: {
        images: true,
        category: true,
      },
    });

    // Create DealProduct relationship
    await prisma.dealProduct.create({
      data: {
        dealId: deal.id,
        productId: dealProduct.id,
      },
    });

    dealProducts.push(dealProduct);
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
