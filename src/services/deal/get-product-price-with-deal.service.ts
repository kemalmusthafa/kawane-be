import prisma from "../../prisma";

interface ProductPriceInfo {
  productId: string;
  originalPrice: number;
  discountedPrice: number;
  dealId?: string;
  dealTitle?: string;
  discountAmount: number;
  discountPercentage: number;
  isFlashSale: boolean;
  dealEndDate?: Date;
}

export const getProductPriceWithDeal = async (
  productId: string
): Promise<ProductPriceInfo> => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
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
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  const activeDeal = product.dealProducts.find((dp) => dp.deal)?.deal;

  if (!activeDeal) {
    return {
      productId: product.id,
      originalPrice: product.price,
      discountedPrice: product.price,
      discountAmount: 0,
      discountPercentage: 0,
      isFlashSale: false,
    };
  }

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

  return {
    productId: product.id,
    originalPrice: product.price,
    discountedPrice: Math.round(discountedPrice * 100) / 100,
    dealId: activeDeal.id,
    dealTitle: activeDeal.title,
    discountAmount: Math.round(discountAmount * 100) / 100,
    discountPercentage,
    isFlashSale: activeDeal.isFlashSale,
    dealEndDate: activeDeal.endDate,
  };
};

export const getMultipleProductsPriceWithDeals = async (
  productIds: string[]
): Promise<ProductPriceInfo[]> => {
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: {
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
    },
  });

  return products.map((product) => {
    const activeDeal = product.dealProducts.find((dp) => dp.deal)?.deal;

    if (!activeDeal) {
      return {
        productId: product.id,
        originalPrice: product.price,
        discountedPrice: product.price,
        discountAmount: 0,
        discountPercentage: 0,
        isFlashSale: false,
      };
    }

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

    return {
      productId: product.id,
      originalPrice: product.price,
      discountedPrice: Math.round(discountedPrice * 100) / 100,
      dealId: activeDeal.id,
      dealTitle: activeDeal.title,
      discountAmount: Math.round(discountAmount * 100) / 100,
      discountPercentage,
      isFlashSale: activeDeal.isFlashSale,
      dealEndDate: activeDeal.endDate,
    };
  });
};
