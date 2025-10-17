import prisma from "../../prisma";

// Threshold untuk stock monitoring
const STOCK_THRESHOLDS = {
  LOW_STOCK: 10, // Stock di bawah 10 = low stock
  OUT_OF_STOCK: 0, // Stock = 0 = out of stock
  CRITICAL_STOCK: 5, // Stock di bawah 5 = critical
};

// Type untuk stock status
type StockStatus = "NORMAL" | "LOW" | "CRITICAL" | "OUT_OF_STOCK";

// Type untuk notification data
type NotificationData = {
  userId: string;
  title: string;
  message: string;
  type: "STOCK_ALERT" | "STOCK_CRITICAL" | "STOCK_OUT";
  data?: any;
};

export class StockMonitoringService {
  // Check stock level dan return status
  static getStockStatus(stock: number): StockStatus {
    if (stock <= STOCK_THRESHOLDS.OUT_OF_STOCK) {
      return "OUT_OF_STOCK";
    } else if (stock <= STOCK_THRESHOLDS.CRITICAL_STOCK) {
      return "CRITICAL";
    } else if (stock <= STOCK_THRESHOLDS.LOW_STOCK) {
      return "LOW";
    }
    return "NORMAL";
  }

  // Monitor semua products dan create notifications jika perlu
  static async monitorAllProducts() {
    try {
      // Get semua products dengan stock yang perlu monitoring
      const products = await prisma.product.findMany({
        where: {
          stock: {
            lte: STOCK_THRESHOLDS.LOW_STOCK,
          },
        },
        include: {
          category: {
            select: {
              name: true,
            },
          },
        },
      });

      // Get semua staff dan admin untuk notification
      const staffUsers = await prisma.user.findMany({
        where: {
          role: {
            in: ["STAFF", "ADMIN"],
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      const notifications: NotificationData[] = [];

      for (const product of products) {
        const stockStatus = this.getStockStatus(product.stock);

        // Skip jika stock normal
        if (stockStatus === "NORMAL") continue;

        // Create notification data berdasarkan status
        const notificationData = this.createStockNotification(
          product,
          stockStatus
        );

        // Add untuk semua staff/admin
        for (const user of staffUsers) {
          notifications.push({
            ...notificationData,
            userId: user.id,
          });
        }
      }

      // Bulk create notifications
      if (notifications.length > 0) {
        await prisma.notification.createMany({
          data: notifications.map((notif) => ({
            userId: notif.userId,
            title: notif.title,
            description: notif.message,
            type: notif.type,
            priority: notif.data?.priority || "MEDIUM",
            url: `/admin/inventory`,
            isRead: false,
            data: JSON.stringify(notif.data),
          })),
        });

        console.log(`📦 Created ${notifications.length} stock notifications`);
      }

      return {
        message: "Stock monitoring completed",
        productsMonitored: products.length,
        notificationsCreated: notifications.length,
      };
    } catch (error) {
      console.error("❌ Stock monitoring failed:", error);
      throw new Error("Failed to monitor stock levels");
    }
  }

  // Create notification data berdasarkan stock status
  private static createStockNotification(product: any, status: StockStatus) {
    const baseData = {
      productId: product.id,
      productName: product.name,
      currentStock: product.stock,
      category: product.category?.name || "Uncategorized",
    };

    switch (status) {
      case "OUT_OF_STOCK":
        return {
          title: "🚨 Product Out of Stock",
          message: `${product.name} is completely out of stock! Immediate restock required.`,
          type: "STOCK_OUT" as const,
          data: {
            ...baseData,
            priority: "HIGH",
            action: "RESTOCK_IMMEDIATELY",
          },
        };

      case "CRITICAL":
        return {
          title: "⚠️ Critical Stock Level",
          message: `${product.name} has critical stock level (${product.stock} units remaining).`,
          type: "STOCK_CRITICAL" as const,
          data: {
            ...baseData,
            priority: "HIGH",
            action: "RESTOCK_SOON",
          },
        };

      case "LOW":
        return {
          title: "📉 Low Stock Alert",
          message: `${product.name} has low stock level (${product.stock} units remaining).`,
          type: "STOCK_ALERT" as const,
          data: {
            ...baseData,
            priority: "MEDIUM",
            action: "MONITOR_CLOSELY",
          },
        };

      default:
        return {
          title: "📦 Stock Update",
          message: `${product.name} stock level updated.`,
          type: "STOCK_ALERT" as const,
          data: {
            ...baseData,
            priority: "LOW",
            action: "MONITOR",
          },
        };
    }
  }

  // Monitor single product (dipanggil saat inventory log dibuat)
  static async monitorSingleProduct(productId: string) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          category: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      const stockStatus = this.getStockStatus(product.stock);

      // Skip jika stock normal
      if (stockStatus === "NORMAL") {
        return { message: "Stock level is normal", status: stockStatus };
      }

      // Get staff/admin users
      const staffUsers = await prisma.user.findMany({
        where: {
          role: {
            in: ["STAFF", "ADMIN"],
          },
        },
        select: {
          id: true,
        },
      });

      // Create notification
      const notificationData = this.createStockNotification(
        product,
        stockStatus
      );

      const notifications = staffUsers.map((user) => ({
        userId: user.id,
        title: notificationData.title,
        description: notificationData.message,
        type: notificationData.type,
        priority: notificationData.data?.priority || "MEDIUM",
        url: `/admin/inventory`,
        isRead: false,
        data: JSON.stringify(notificationData.data),
      }));

      // Create notifications
      await prisma.notification.createMany({
        data: notifications,
      });

      return {
        message: "Stock monitoring completed",
        status: stockStatus,
        notificationsCreated: notifications.length,
      };
    } catch (error) {
      console.error("❌ Single product monitoring failed:", error);
      throw new Error("Failed to monitor product stock");
    }
  }

  // Get stock summary untuk dashboard
  static async getStockSummary() {
    try {
      const [
        totalProducts,
        lowStockProducts,
        criticalStockProducts,
        outOfStockProducts,
      ] = await Promise.all([
        prisma.product.count({
          where: {},
        }),
        prisma.product.count({
          where: {
            stock: {
              lte: STOCK_THRESHOLDS.LOW_STOCK,
              gt: STOCK_THRESHOLDS.CRITICAL_STOCK,
            },
          },
        }),
        prisma.product.count({
          where: {
            stock: {
              lte: STOCK_THRESHOLDS.CRITICAL_STOCK,
              gt: STOCK_THRESHOLDS.OUT_OF_STOCK,
            },
          },
        }),
        prisma.product.count({
          where: {
            stock: {
              lte: STOCK_THRESHOLDS.OUT_OF_STOCK,
            },
          },
        }),
      ]);

      return {
        totalProducts,
        lowStockProducts,
        criticalStockProducts,
        outOfStockProducts,
        thresholds: STOCK_THRESHOLDS,
      };
    } catch (error) {
      console.error("❌ Stock summary failed:", error);
      throw new Error("Failed to get stock summary");
    }
  }

  // Get low stock products dengan pagination
  static async getLowStockProducts(params: { page: number; limit: number }) {
    try {
      const { page, limit } = params;
      const offset = (page - 1) * limit;

      // Get products with low stock
      const products = await prisma.product.findMany({
        where: {
          stock: {
            lte: STOCK_THRESHOLDS.LOW_STOCK,
          },
        },
        select: {
          id: true,
          name: true,
          stock: true,
          price: true,
          createdAt: true,
          updatedAt: true,
          category: {
            select: {
              name: true,
            },
          },
          images: {
            select: {
              url: true,
            },
            take: 1, // Ambil hanya gambar pertama
          },
        },
        orderBy: {
          stock: "asc", // Sort by stock level (lowest first)
        },
        take: limit,
        skip: offset,
      });

      // Get total count
      const totalCount = await prisma.product.count({
        where: {
          stock: {
            lte: STOCK_THRESHOLDS.LOW_STOCK,
          },
        },
      });

      // Transform products dengan stock status
      const transformedProducts = products.map((product) => ({
        id: product.id,
        name: product.name,
        stock: product.stock,
        status: this.getStockStatus(product.stock),
        category: product.category?.name || "Uncategorized",
        price: product.price,
        image: product.images[0]?.url || null, // Ambil URL gambar pertama atau null
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      }));

      return {
        products: transformedProducts,
        pagination: {
          page,
          limit,
          totalItems: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error("❌ Get low stock products failed:", error);
      throw new Error("Failed to get low stock products");
    }
  }
}
