import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getInventorySummaryService() {
  // Get all products with their stock information and recent inventory logs
  const products = await prisma.product.findMany({
    include: {
      category: {
        select: { name: true },
      },
      sizes: true,
      inventoryLogs: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          change: true,
          note: true,
          createdAt: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  // Calculate summary statistics
  const totalProducts = products.length;
  const inStock = products.filter((p) => p.stock > 10).length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 10).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;

  // Transform products to inventory items
  const inventory = products.flatMap((product) => {
    // If product has sizes, create one inventory item per size
    if (product.sizes && product.sizes.length > 0) {
      return product.sizes.map((size) => {
        let status = "IN_STOCK";
        if (size.stock === 0) {
          status = "OUT_OF_STOCK";
        } else if (size.stock <= 10) {
          status = "LOW_STOCK";
        }

        // Get last restock date from inventory logs
        const lastRestockLog = product.inventoryLogs.find(
          (log) => log.change > 0
        );
        const lastRestock = lastRestockLog
          ? lastRestockLog.createdAt.toISOString().split("T")[0]
          : product.updatedAt.toISOString().split("T")[0];

        return {
          id: `inv-${product.id}-${size.id}`,
          productId: product.id,
          productName: `${product.name} - ${size.size}`,
          size: size.size,
          currentStock: size.stock,
          minStock: 10, // Default minimum stock
          maxStock: 500, // Default maximum stock
          lastRestock,
          lastActivity:
            product.inventoryLogs[0]?.createdAt.toISOString().split("T")[0] ||
            product.updatedAt.toISOString().split("T")[0],
          status,
          category: product.category?.name || "No Category",
          lastActivityNote:
            product.inventoryLogs[0]?.note || "No recent activity",
        };
      });
    } else {
      // If product has no sizes, use the main product stock
      let status = "IN_STOCK";
      if (product.stock === 0) {
        status = "OUT_OF_STOCK";
      } else if (product.stock <= 10) {
        status = "LOW_STOCK";
      }

      // Get last restock date from inventory logs
      const lastRestockLog = product.inventoryLogs.find(
        (log) => log.change > 0
      );
      const lastRestock = lastRestockLog
        ? lastRestockLog.createdAt.toISOString().split("T")[0]
        : product.updatedAt.toISOString().split("T")[0];

      return {
        id: `inv-${product.id}`,
        productId: product.id,
        productName: product.name,
        size: "No Size",
        currentStock: product.stock,
        minStock: 10, // Default minimum stock
        maxStock: 500, // Default maximum stock
        lastRestock,
        lastActivity:
          product.inventoryLogs[0]?.createdAt.toISOString().split("T")[0] ||
          product.updatedAt.toISOString().split("T")[0],
        status,
        category: product.category?.name || "No Category",
        lastActivityNote:
          product.inventoryLogs[0]?.note || "No recent activity",
      };
    }
  });

  return {
    inventory,
    summary: {
      totalProducts,
      inStock,
      lowStock,
      outOfStock,
    },
    total: inventory.length,
    page: 1,
    limit: inventory.length,
  };
}
