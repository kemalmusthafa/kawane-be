import prisma from "../../prisma";
import { Prisma } from "../../../prisma/generated/client";

// Type untuk input yang sudah di-validate oleh Zod middleware
type CreateProductInput = {
  name: string;
  description?: string;
  price: number;
  sku?: string;
  stock: number;
  categoryId?: string;
  images?: string[];
};

export const createProductService = async (input: CreateProductInput) => {
  const { name, description, price, sku, stock, categoryId, images } = input;

  // Business logic validation
  if (sku) {
    const existingSku = await prisma.product.findUnique({
      where: { sku },
    });
    if (existingSku) throw new Error("SKU already exists");
  }

  if (categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) throw new Error("Category not found");
  }

  // Create product
  const product = await prisma.product.create({
    data: {
      name,
      description,
      price,
      sku,
      stock,
      categoryId,
      images: images
        ? {
            create: images.map((url) => ({ url })),
          }
        : undefined,
    },
    include: {
      category: true,
      images: true,
    },
  });

  // Create inventory log for initial stock
  if (stock > 0) {
    await prisma.inventoryLog.create({
      data: {
        productId: product.id,
        change: stock,
        note: "Initial stock",
      },
    });
  }

  return product;
};
