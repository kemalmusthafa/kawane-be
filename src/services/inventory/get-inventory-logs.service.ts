import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface GetInventoryLogsParams {
  productId?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  changeType?: "increase" | "decrease" | "all";
}

export async function getInventoryLogsService(
  params: GetInventoryLogsParams = {}
) {
  const {
    productId,
    page = 1,
    limit = 20,
    startDate,
    endDate,
    changeType = "all",
  } = params;

  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {};

  if (productId) {
    where.productId = productId;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = new Date(startDate);
    }
    if (endDate) {
      where.createdAt.lte = new Date(endDate);
    }
  }

  if (changeType !== "all") {
    if (changeType === "increase") {
      where.change = { gt: 0 };
    } else if (changeType === "decrease") {
      where.change = { lt: 0 };
    }
  }

  // Get inventory logs with pagination
  const [logs, total] = await Promise.all([
    prisma.inventoryLog.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            stock: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.inventoryLog.count({ where }),
  ]);

  // Calculate summary statistics
  const summary = await prisma.inventoryLog.aggregate({
    where,
    _sum: {
      change: true,
    },
    _count: {
      id: true,
    },
  });

  // Get recent activity summary
  const recentActivity = await prisma.inventoryLog.groupBy({
    by: ["productId"],
    where: {
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      },
    },
    _sum: {
      change: true,
    },
    _count: {
      id: true,
    },
  });

  return {
    logs: logs.map((log) => ({
      id: log.id,
      productId: log.productId,
      productName: log.product.name,
      productSku: log.product.sku,
      currentStock: log.product.stock,
      category: log.product.category?.name || "No Category",
      change: log.change,
      changeType:
        log.change > 0 ? "increase" : log.change < 0 ? "decrease" : "neutral",
      note: log.note,
      createdAt: log.createdAt,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
    summary: {
      totalChanges: summary._count.id,
      netChange: summary._sum.change || 0,
      recentActivityCount: recentActivity.length,
    },
  };
}
