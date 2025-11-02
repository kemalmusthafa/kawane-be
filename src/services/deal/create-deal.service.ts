import prisma from "../../prisma";
import { DealType, DealStatus } from "../../../prisma/generated/client";

interface CreateDealData {
  title: string;
  description?: string;
  type: DealType;
  value: number;
  startDate: Date;
  endDate: Date;
  image?: string;
  images?: string[];
  isFlashSale?: boolean;
  maxUses?: number;
  // Product information for auto-creation
  productName: string;
  productDescription?: string;
  productPrice: number;
  productSku?: string;
  productStock?: number;
  categoryId?: string;
  sizes?: Array<{ size: string; stock: number }>;
}

export const createDealService = async (data: CreateDealData) => {
  const {
    title,
    description,
    type,
    value,
    startDate,
    endDate,
    image,
    images = [],
    isFlashSale = false,
    maxUses,
    productName,
    productDescription,
    productPrice,
    productSku,
    productStock = 0,
    categoryId,
    sizes = [],
  } = data;

  // Handle empty image string
  const imageUrl = image && image.trim() ? image.trim() : undefined;

  // Validate dates
  if (startDate >= endDate) {
    throw new Error("Start date must be before end date");
  }

  // Validate value based on type
  if (type === "PERCENTAGE" && (value < 0 || value > 100)) {
    throw new Error("Percentage value must be between 0 and 100");
  }

  if (type === "FIXED_AMOUNT" && value < 0) {
    throw new Error("Fixed amount value must be positive");
  }

  // Validate product price
  if (productPrice <= 0) {
    throw new Error("Product price must be greater than 0");
  }

  // Validate SKU uniqueness if provided
  if (productSku) {
    const existingSku = await prisma.product.findUnique({
      where: { sku: productSku },
    });
    if (existingSku) {
      throw new Error("SKU already exists");
    }
  }

  // Validate category if provided
  if (categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new Error("Category not found");
    }
  }

  // Create deal with product in transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create deal
    const newDeal = await tx.deal.create({
      data: {
        title,
        description,
        type,
        value,
        startDate,
        endDate,
        image: imageUrl,
        isFlashSale,
        maxUses,
        status: "ACTIVE",
        images:
          images.length > 0
            ? {
                create: images.map((url) => ({ url })),
              }
            : undefined,
      },
    });

    // Calculate discounted price for the product
    let discountedPrice = productPrice;
    if (type === "PERCENTAGE") {
      discountedPrice = productPrice * (1 - value / 100);
    } else if (type === "FIXED_AMOUNT") {
      discountedPrice = Math.max(0, productPrice - value);
    }

    // Calculate total stock from sizes if provided, otherwise use productStock
    const calculatedStock =
      sizes.length > 0
        ? sizes.reduce((total, sizeItem) => total + (sizeItem.stock || 0), 0)
        : productStock;

    // Create product for the deal
    const dealProduct = await tx.product.create({
      data: {
        name: productName,
        description: productDescription || `🎉 DEAL SPECIAL: ${title}`,
        price: discountedPrice,
        stock: calculatedStock,
        sku: productSku || `DEAL-${newDeal.id.slice(-8)}`,
        categoryId,
        status: "ACTIVE",
        images:
          images.length > 0
            ? {
                create: images.map((url) => ({ url })),
              }
            : undefined,
        sizes:
          sizes.length > 0
            ? {
                create: sizes
                  .filter((s) => s.size && s.size.trim() !== "")
                  .map((sizeItem) => ({
                    size: sizeItem.size.trim().toUpperCase(),
                    stock: sizeItem.stock || 0,
                  })),
              }
            : undefined,
      },
      include: {
        images: true,
        category: true,
        sizes: true,
      },
    });

    // Create DealProduct relationship
    await tx.dealProduct.create({
      data: {
        dealId: newDeal.id,
        productId: dealProduct.id,
      },
    });

    // Create inventory log for initial stock
    if (calculatedStock > 0) {
      await tx.inventoryLog.create({
        data: {
          productId: dealProduct.id,
          change: calculatedStock,
          note: "Initial stock for deal product",
        },
      });
    }

    return {
      deal: newDeal,
      product: dealProduct,
    };
  });

  return {
    success: true,
    message: "Deal created successfully with new product",
    data: {
      deal: result.deal,
      product: result.product,
      dealInfo: {
        originalPrice: productPrice,
        discountedPrice: result.product.price,
        discountAmount: productPrice - result.product.price,
        discountPercentage: Math.round(
          ((productPrice - result.product.price) / productPrice) * 100
        ),
      },
    },
  };
};
