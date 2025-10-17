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
  sizes?: Array<{
    size: string;
    stock: number;
  }>;
  images?: string[];
};

export const createProductService = async (input: CreateProductInput) => {
  const { name, description, price, sku, stock, categoryId, sizes, images } = input;

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

  // Calculate total stock from sizes if provided
  const totalStock = sizes && sizes.length > 0 
    ? sizes.reduce((sum, size) => sum + size.stock, 0)
    : stock;

  // Create product
  const product = await prisma.$transaction(async (tx) => {
    const newProduct = await tx.product.create({
      data: {
        name,
        description,
        price,
        sku,
        stock: totalStock,
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
        sizes: true,
      },
    });

    // Create sizes if provided
    if (sizes && sizes.length > 0) {
      await tx.productSize.createMany({
        data: sizes.map((size) => ({
          productId: newProduct.id,
          size: size.size,
          stock: size.stock,
        })),
      });
    }

    // Create inventory log for initial stock
    if (totalStock > 0) {
      await tx.inventoryLog.create({
        data: {
          productId: newProduct.id,
          change: totalStock,
          note: "Initial stock",
        },
      });
    }

    return tx.product.findUnique({
      where: { id: newProduct.id },
      include: {
        category: true,
        images: true,
        sizes: true,
      },
    });
  });

  return product;
};
