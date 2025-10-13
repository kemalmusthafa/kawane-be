"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendFlashSaleNotificationService = exports.sendWishlistProductNotificationService = exports.sendProductLaunchNotificationService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const sendProductLaunchNotificationService = async (data) => {
    try {
        // Get product details
        const product = await prisma_1.default.product.findUnique({
            where: { id: data.productId },
            include: {
                category: { select: { name: true } },
                images: { select: { url: true } },
            },
        });
        if (!product) {
            throw new Error("Product not found");
        }
        // Get all customers (users with CUSTOMER role)
        const customers = await prisma_1.default.user.findMany({
            where: { role: "CUSTOMER" },
            select: { id: true, name: true, email: true },
        });
        if (customers.length === 0) {
            return { message: "No customers found to notify" };
        }
        // Prepare notification data
        const notificationTitle = data.title || `🆕 New Product: ${product.name}`;
        const notificationMessage = data.message ||
            `Check out our latest ${product.category?.name || "product"}: ${product.name}! Available now for Rp ${product.price.toLocaleString()}`;
        // Create notifications for all customers
        const notifications = customers.map((customer) => ({
            userId: customer.id,
            title: notificationTitle,
            message: notificationMessage,
            description: notificationMessage,
            type: "PRODUCT_LAUNCH",
            data: JSON.stringify({
                productId: product.id,
                productName: product.name,
                productPrice: product.price,
                productImage: product.images[0]?.url || null,
                category: product.category?.name || "Uncategorized",
            }),
            isRead: false,
        }));
        // Bulk create notifications
        await prisma_1.default.notification.createMany({
            data: notifications,
        });
        return {
            message: "Product launch notifications sent successfully",
            productName: product.name,
            customersNotified: customers.length,
            notificationsCreated: notifications.length,
        };
    }
    catch (error) {
        console.error("❌ Product launch notification failed:", error);
        throw new Error("Failed to send product launch notifications");
    }
};
exports.sendProductLaunchNotificationService = sendProductLaunchNotificationService;
// Service untuk notifikasi product yang di-wishlist
const sendWishlistProductNotificationService = async (productId, notificationType) => {
    try {
        // Get product details
        const product = await prisma_1.default.product.findUnique({
            where: { id: productId },
            include: {
                category: { select: { name: true } },
                images: { select: { url: true } },
            },
        });
        if (!product) {
            throw new Error("Product not found");
        }
        // Get users who have this product in their wishlist
        const wishlistUsers = await prisma_1.default.wishlist.findMany({
            where: { productId },
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
        if (wishlistUsers.length === 0) {
            return { message: "No users have this product in their wishlist" };
        }
        // Prepare notification data based on type
        let notificationTitle = "";
        let notificationMessage = "";
        switch (notificationType) {
            case "BACK_IN_STOCK":
                notificationTitle = "📦 Product Back in Stock!";
                notificationMessage = `${product.name} is back in stock! Don't miss out on this ${product.category?.name || "product"}.`;
                break;
            case "DISCOUNT":
                notificationTitle = "🎉 Special Discount Alert!";
                notificationMessage = `${product.name} is now on sale! Check out the special discount on this ${product.category?.name || "product"}.`;
                break;
            case "PRICE_DROP":
                notificationTitle = "💰 Price Drop Alert!";
                notificationMessage = `Great news! The price of ${product.name} has dropped. Get it now for a better deal!`;
                break;
        }
        // Create notifications for wishlist users
        const notifications = wishlistUsers.map((wishlist) => ({
            userId: wishlist.user.id,
            title: notificationTitle,
            message: notificationMessage,
            description: notificationMessage,
            type: "WISHLIST_UPDATE",
            data: JSON.stringify({
                productId: product.id,
                productName: product.name,
                productPrice: product.price,
                productImage: product.images[0]?.url || null,
                notificationType: notificationType,
                category: product.category?.name || "Uncategorized",
            }),
            isRead: false,
        }));
        // Bulk create notifications
        await prisma_1.default.notification.createMany({
            data: notifications,
        });
        return {
            message: "Wishlist notifications sent successfully",
            productName: product.name,
            usersNotified: wishlistUsers.length,
            notificationsCreated: notifications.length,
            notificationType,
        };
    }
    catch (error) {
        console.error("❌ Wishlist notification failed:", error);
        throw new Error("Failed to send wishlist notifications");
    }
};
exports.sendWishlistProductNotificationService = sendWishlistProductNotificationService;
// Service untuk notifikasi flash sale atau limited time offer
const sendFlashSaleNotificationService = async (productIds, discountPercentage, endTime) => {
    try {
        // Get products details
        const products = await prisma_1.default.product.findMany({
            where: { id: { in: productIds } },
            include: {
                category: { select: { name: true } },
                images: { select: { url: true } },
            },
        });
        if (products.length === 0) {
            throw new Error("No products found");
        }
        // Get all customers
        const customers = await prisma_1.default.user.findMany({
            where: { role: "CUSTOMER" },
            select: { id: true, name: true, email: true },
        });
        if (customers.length === 0) {
            return { message: "No customers found to notify" };
        }
        const productNames = products.map((p) => p.name).join(", ");
        const notificationTitle = "⚡ Flash Sale Alert!";
        const notificationMessage = `Flash sale on ${productNames}! Get ${discountPercentage}% off. Limited time offer ends ${endTime.toLocaleString()}`;
        // Create notifications for all customers
        const notifications = customers.map((customer) => ({
            userId: customer.id,
            title: notificationTitle,
            message: notificationMessage,
            description: notificationMessage,
            type: "FLASH_SALE",
            data: JSON.stringify({
                productIds: productIds,
                productNames: productNames,
                discountPercentage: discountPercentage,
                endTime: endTime.toISOString(),
                products: products.map((p) => ({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    image: p.images[0]?.url || null,
                    category: p.category?.name || "Uncategorized",
                })),
            }),
            isRead: false,
        }));
        // Bulk create notifications
        await prisma_1.default.notification.createMany({
            data: notifications,
        });
        return {
            message: "Flash sale notifications sent successfully",
            productNames: productNames,
            customersNotified: customers.length,
            notificationsCreated: notifications.length,
            discountPercentage,
            endTime,
        };
    }
    catch (error) {
        console.error("❌ Flash sale notification failed:", error);
        throw new Error("Failed to send flash sale notifications");
    }
};
exports.sendFlashSaleNotificationService = sendFlashSaleNotificationService;
