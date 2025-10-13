"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockMonitoringService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
// Threshold untuk stock monitoring
const STOCK_THRESHOLDS = {
    LOW_STOCK: 10, // Stock di bawah 10 = low stock
    OUT_OF_STOCK: 0, // Stock = 0 = out of stock
    CRITICAL_STOCK: 5, // Stock di bawah 5 = critical
};
class StockMonitoringService {
    // Check stock level dan return status
    static getStockStatus(stock) {
        if (stock <= STOCK_THRESHOLDS.OUT_OF_STOCK) {
            return "OUT_OF_STOCK";
        }
        else if (stock <= STOCK_THRESHOLDS.CRITICAL_STOCK) {
            return "CRITICAL";
        }
        else if (stock <= STOCK_THRESHOLDS.LOW_STOCK) {
            return "LOW";
        }
        return "NORMAL";
    }
    // Monitor semua products dan create notifications jika perlu
    static async monitorAllProducts() {
        try {
            // Get semua products dengan stock yang perlu monitoring
            const products = await prisma_1.default.product.findMany({
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
            const staffUsers = await prisma_1.default.user.findMany({
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
            const notifications = [];
            for (const product of products) {
                const stockStatus = this.getStockStatus(product.stock);
                // Skip jika stock normal
                if (stockStatus === "NORMAL")
                    continue;
                // Create notification data berdasarkan status
                const notificationData = this.createStockNotification(product, stockStatus);
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
                await prisma_1.default.notification.createMany({
                    data: notifications.map((notif) => ({
                        userId: notif.userId,
                        title: notif.title,
                        description: notif.message,
                        isRead: false,
                    })),
                });
                console.log(`📦 Created ${notifications.length} stock notifications`);
            }
            return {
                message: "Stock monitoring completed",
                productsMonitored: products.length,
                notificationsCreated: notifications.length,
            };
        }
        catch (error) {
            console.error("❌ Stock monitoring failed:", error);
            throw new Error("Failed to monitor stock levels");
        }
    }
    // Create notification data berdasarkan stock status
    static createStockNotification(product, status) {
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
                    type: "STOCK_OUT",
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
                    type: "STOCK_CRITICAL",
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
                    type: "STOCK_ALERT",
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
                    type: "STOCK_ALERT",
                    data: baseData,
                };
        }
    }
    // Monitor single product (dipanggil saat inventory log dibuat)
    static async monitorSingleProduct(productId) {
        try {
            const product = await prisma_1.default.product.findUnique({
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
            const staffUsers = await prisma_1.default.user.findMany({
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
            const notificationData = this.createStockNotification(product, stockStatus);
            const notifications = staffUsers.map((user) => ({
                userId: user.id,
                title: notificationData.title,
                description: notificationData.message,
                isRead: false,
            }));
            // Create notifications
            await prisma_1.default.notification.createMany({
                data: notifications,
            });
            return {
                message: "Stock monitoring completed",
                status: stockStatus,
                notificationsCreated: notifications.length,
            };
        }
        catch (error) {
            console.error("❌ Single product monitoring failed:", error);
            throw new Error("Failed to monitor product stock");
        }
    }
    // Get stock summary untuk dashboard
    static async getStockSummary() {
        try {
            const [totalProducts, lowStockProducts, criticalStockProducts, outOfStockProducts,] = await Promise.all([
                prisma_1.default.product.count({
                    where: {},
                }),
                prisma_1.default.product.count({
                    where: {
                        stock: {
                            lte: STOCK_THRESHOLDS.LOW_STOCK,
                            gt: STOCK_THRESHOLDS.CRITICAL_STOCK,
                        },
                    },
                }),
                prisma_1.default.product.count({
                    where: {
                        stock: {
                            lte: STOCK_THRESHOLDS.CRITICAL_STOCK,
                            gt: STOCK_THRESHOLDS.OUT_OF_STOCK,
                        },
                    },
                }),
                prisma_1.default.product.count({
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
        }
        catch (error) {
            console.error("❌ Stock summary failed:", error);
            throw new Error("Failed to get stock summary");
        }
    }
}
exports.StockMonitoringService = StockMonitoringService;
