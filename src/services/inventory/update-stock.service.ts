import prisma from "../../prisma";

interface UpdateStockData {
  productId: string;
  change: number;
  note?: string;
  type: "restock" | "sale" | "adjustment" | "damage";
}

export const updateStockService = async (data: UpdateStockData) => {
  const product = await prisma.product.findUnique({
    where: { id: data.productId },
  });

  if (!product) throw new Error("Product not found");

  const newStock = product.stock + data.change;
  if (newStock < 0) throw new Error("Stock cannot be negative");

  const [updatedProduct, inventoryLog] = await prisma.$transaction([
    prisma.product.update({
      where: { id: data.productId },
      data: { stock: newStock },
    }),
    prisma.inventoryLog.create({
      data: {
        productId: data.productId,
        change: data.change,
        note:
          data.note ||
          `${data.type}: ${data.change > 0 ? "+" : ""}${data.change}`,
      },
    }),
  ]);

  return {
    product: updatedProduct,
    inventoryLog,
    previousStock: product.stock,
    newStock,
  };
};
