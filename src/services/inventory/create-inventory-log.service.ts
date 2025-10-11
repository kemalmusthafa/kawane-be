import prisma from "../../prisma";
import { StockMonitoringService } from "./stock-monitoring.service";

// Type untuk input yang sudah di-validate oleh middleware
type CreateInventoryLogInput = {
  productId: string;
  change: number; // positive for restock, negative for sales
  note?: string;
};

export const createInventoryLogService = async (
  input: CreateInventoryLogInput
) => {
  const { productId, change, note } = input;

  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  // Create inventory log
  const inventoryLog = await prisma.inventoryLog.create({
    data: {
      productId,
      change,
      note,
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
          stock: true,
        },
      },
    },
  });

  // Update product stock
  const newStock = product.stock + change;

  if (newStock < 0) {
    throw new Error("Insufficient stock for this operation");
  }

  await prisma.product.update({
    where: { id: productId },
    data: { stock: newStock },
  });

  // 🔔 AUTOMATIC STOCK MONITORING & NOTIFICATION
  let monitoringResult = null;
  try {
    // Monitor stock level dan create notifications jika perlu
    monitoringResult = await StockMonitoringService.monitorSingleProduct(
      productId
    );
  } catch (error) {
    console.error("⚠️ Stock monitoring failed:", error);
    // Don't throw error, just log it
  }

  return {
    message: "Inventory log created successfully",
    log: {
      id: inventoryLog.id,
      productId: inventoryLog.productId,
      change: inventoryLog.change,
      note: inventoryLog.note,
      createdAt: inventoryLog.createdAt,
      product: {
        id: inventoryLog.product.id,
        name: inventoryLog.product.name,
        sku: inventoryLog.product.sku,
        oldStock: product.stock,
        newStock: newStock,
      },
    },
    monitoring: monitoringResult, // Include monitoring result
  };
};
