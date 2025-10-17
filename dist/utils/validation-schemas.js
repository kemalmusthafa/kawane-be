"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryQuerySchema = exports.updateCategorySchema = exports.createCategorySchema = exports.trackingNumberParamSchema = exports.shipmentIdParamSchema = exports.shipmentQuerySchema = exports.updateShipmentSchema = exports.createShipmentSchema = exports.flashSaleNotificationSchema = exports.wishlistNotificationSchema = exports.productLaunchNotificationSchema = exports.lowStockQuerySchema = exports.createInventoryLogSchema = exports.inventoryLogQuerySchema = exports.createStaffSchema = exports.createAdminSchema = exports.paginationSchema = exports.categoryIdParamSchema = exports.paymentIdParamSchema = exports.orderIdParamSchema = exports.productIdParamSchema = exports.idParamSchema = exports.toggleWishlistSchema = exports.createReviewSchema = exports.dashboardQuerySchema = exports.markAsReadSchema = exports.notificationQuerySchema = exports.updatePaymentStatusSchema = exports.createPaymentSchema = exports.createAddressSchema = exports.updateWhatsAppOrderStatusSchema = exports.createWhatsAppOrderSchema = exports.orderQuerySchema = exports.updateOrderStatusSchema = exports.createOrderSchema = exports.cartItemIdParamSchema = exports.updateCartItemSchema = exports.addDealToCartSchema = exports.addToCartSchema = exports.productQuerySchema = exports.updateProductSchema = exports.createProductSchema = exports.userQuerySchema = exports.updateUserSchema = exports.createUserSchema = exports.googleTokenSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.loginSchema = exports.registerSchema = void 0;
exports.validationSchemas = exports.updateSettingsSchema = exports.dealIdParamSchema = exports.dealQuerySchema = exports.updateDealSchema = exports.createDealSchema = exports.reportIdParamSchema = exports.generateReportSchema = exports.reportsQuerySchema = exports.analyticsQuerySchema = void 0;
const zod_1 = require("zod");
// ========================================
// 🔐 AUTHENTICATION VALIDATION SCHEMAS
// ========================================
exports.registerSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name cannot exceed 50 characters")
        .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
    email: zod_1.z
        .string()
        .email("Invalid email format")
        .min(5, "Email too short")
        .max(100, "Email too long"),
    password: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password too long")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one lowercase letter, one uppercase letter, and one number"),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(1, "Password is required"),
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
});
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, "Token is required"),
    newPassword: zod_1.z
        .string()
        .min(6, "Password must be at least 6 characters")
        .max(100, "Password too long"),
});
exports.googleTokenSchema = zod_1.z.object({
    code: zod_1.z.string().min(1, "Google authorization code is required"),
});
// ========================================
// 👥 USER VALIDATION SCHEMAS
// ========================================
exports.createUserSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name cannot exceed 50 characters"),
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one lowercase letter, one uppercase letter, and one number"),
    role: zod_1.z.enum(["CUSTOMER", "STAFF", "ADMIN"]).optional().default("CUSTOMER"),
});
exports.updateUserSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name cannot exceed 50 characters")
        .optional(),
    email: zod_1.z.string().email("Invalid email format").optional(),
    phone: zod_1.z
        .string()
        .regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone number format")
        .optional(),
    avatar: zod_1.z.string().url("Invalid avatar URL").optional(),
    role: zod_1.z.enum(["CUSTOMER", "STAFF", "ADMIN"]).optional(),
    isVerified: zod_1.z.boolean().optional(),
});
exports.userQuerySchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    page: zod_1.z.coerce.number().int().min(1, "Page must be at least 1").default(1),
    limit: zod_1.z.coerce
        .number()
        .int()
        .min(1, "Limit must be at least 1")
        .max(100, "Limit cannot exceed 100")
        .default(10),
});
// ========================================
// 🛍️ PRODUCT VALIDATION SCHEMAS
// ========================================
exports.createProductSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(3, "Product name must be at least 3 characters")
        .max(100, "Product name cannot exceed 100 characters"),
    description: zod_1.z
        .string()
        .max(1000, "Description cannot exceed 1000 characters")
        .optional(),
    price: zod_1.z
        .number()
        .positive("Price must be positive")
        .min(0.01, "Price must be at least 0.01"),
    // sku: z
    //   .string()
    //   .min(3, "SKU must be at least 3 characters")
    //   .max(50, "SKU cannot exceed 50 characters")
    //   .optional(),
    stock: zod_1.z
        .number()
        .int("Stock must be an integer")
        .min(0, "Stock cannot be negative")
        .default(0),
    categoryId: zod_1.z.string().uuid("Invalid category ID").optional(),
    sizes: zod_1.z
        .array(zod_1.z.object({
        size: zod_1.z
            .string()
            .min(1, "Size is required")
            .max(20, "Size cannot exceed 20 characters"),
        stock: zod_1.z
            .number()
            .int("Stock must be an integer")
            .min(0, "Stock cannot be negative")
            .default(0),
    }))
        .optional(),
    images: zod_1.z.array(zod_1.z.string().url("Invalid image URL")).optional(),
});
exports.updateProductSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(3, "Product name must be at least 3 characters")
        .max(100, "Product name cannot exceed 100 characters")
        .optional(),
    description: zod_1.z
        .string()
        .max(1000, "Description cannot exceed 1000 characters")
        .optional(),
    price: zod_1.z
        .number()
        .positive("Price must be positive")
        .min(0.01, "Price must be at least 0.01")
        .optional(),
    stock: zod_1.z
        .number()
        .int("Stock must be an integer")
        .min(0, "Stock cannot be negative")
        .optional(),
    categoryId: zod_1.z.string().min(1, "Category ID cannot be empty").optional(),
    sizes: zod_1.z
        .array(zod_1.z.object({
        size: zod_1.z
            .string()
            .min(1, "Size is required")
            .max(20, "Size cannot exceed 20 characters"),
        stock: zod_1.z
            .number()
            .int("Stock must be an integer")
            .min(0, "Stock cannot be negative")
            .default(0),
    }))
        .optional(),
    images: zod_1.z.array(zod_1.z.string().url("Invalid image URL")).optional(),
});
exports.productQuerySchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    categoryId: zod_1.z.string().min(1, "Category ID is required").optional(),
    status: zod_1.z.enum(["active", "out_of_stock", "inactive"]).optional(),
    inStock: zod_1.z.coerce.boolean().optional(),
    minPrice: zod_1.z.coerce.number().positive("Min price must be positive").optional(),
    maxPrice: zod_1.z.coerce.number().positive("Max price must be positive").optional(),
    page: zod_1.z.coerce.number().int().min(1, "Page must be at least 1").default(1),
    limit: zod_1.z.coerce
        .number()
        .int()
        .min(1, "Limit must be at least 1")
        .max(100, "Limit cannot exceed 100")
        .default(10),
    sortBy: zod_1.z.enum(["name", "price", "createdAt"]).default("createdAt"),
    sortOrder: zod_1.z.enum(["asc", "desc"]).default("desc"),
});
// ========================================
// 🛒 CART VALIDATION SCHEMAS
// ========================================
exports.addToCartSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid("Invalid product ID"),
    quantity: zod_1.z
        .number()
        .int("Quantity must be an integer")
        .positive("Quantity must be positive")
        .min(1, "Quantity must be at least 1")
        .max(100, "Quantity cannot exceed 100"),
    size: zod_1.z.string().optional(),
});
exports.addDealToCartSchema = zod_1.z.object({
    dealId: zod_1.z.string().uuid("Invalid deal ID"),
    productId: zod_1.z.string().uuid("Invalid product ID"),
    quantity: zod_1.z
        .number()
        .int("Quantity must be an integer")
        .positive("Quantity must be positive")
        .min(1, "Quantity must be at least 1")
        .max(100, "Quantity cannot exceed 100"),
});
exports.updateCartItemSchema = zod_1.z.object({
    quantity: zod_1.z
        .number()
        .int("Quantity must be an integer")
        .positive("Quantity must be positive")
        .min(1, "Quantity must be at least 1")
        .max(100, "Quantity cannot exceed 100"),
});
exports.cartItemIdParamSchema = zod_1.z.object({
    cartItemId: zod_1.z.string().uuid("Invalid cart item ID"),
});
// ========================================
// 🛒 ORDER VALIDATION SCHEMAS
// ========================================
exports.createOrderSchema = zod_1.z.object({
    items: zod_1.z
        .array(zod_1.z.object({
        productId: zod_1.z.string().uuid("Invalid product ID"),
        quantity: zod_1.z
            .number()
            .int("Quantity must be an integer")
            .positive("Quantity must be positive")
            .min(1, "Quantity must be at least 1"),
        size: zod_1.z.string().optional(), // ✅ Added size field
    }))
        .min(1, "At least one item is required"),
    totalAmount: zod_1.z
        .number()
        .positive("Total amount must be positive")
        .min(0.01, "Total amount must be at least 0.01")
        .optional(),
    shippingAddress: zod_1.z
        .string()
        .min(10, "Shipping address must be at least 10 characters")
        .max(500, "Shipping address cannot exceed 500 characters"),
    paymentMethod: zod_1.z
        .enum(["WHATSAPP_MANUAL", "BANK_TRANSFER", "CASH_ON_DELIVERY"])
        .default("WHATSAPP_MANUAL"),
    addressId: zod_1.z.string().uuid("Invalid address ID").optional().nullable(),
    notes: zod_1.z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});
exports.updateOrderStatusSchema = zod_1.z.object({
    status: zod_1.z.enum([
        "CHECKOUT",
        "PAID",
        "PENDING",
        "SHIPPED",
        "COMPLETED",
        "CANCELLED",
        "WHATSAPP_PENDING",
        "WHATSAPP_CONFIRMED",
    ]),
});
exports.orderQuerySchema = zod_1.z.object({
    status: zod_1.z
        .enum([
        "CHECKOUT",
        "PAID",
        "PENDING",
        "SHIPPED",
        "COMPLETED",
        "CANCELLED",
        "WHATSAPP_PENDING",
        "WHATSAPP_CONFIRMED",
    ])
        .optional(),
    search: zod_1.z.string().optional(),
    page: zod_1.z.coerce.number().int().min(1, "Page must be at least 1").default(1),
    limit: zod_1.z.coerce
        .number()
        .int()
        .min(1, "Limit must be at least 1")
        .max(100, "Limit cannot exceed 100")
        .default(10),
});
// ========================================
// 📱 WHATSAPP ORDER VALIDATION SCHEMAS
// ========================================
exports.createWhatsAppOrderSchema = zod_1.z.object({
    items: zod_1.z
        .array(zod_1.z.object({
        productId: zod_1.z.string().uuid("Invalid product ID"),
        quantity: zod_1.z
            .number()
            .int("Quantity must be an integer")
            .positive("Quantity must be positive")
            .min(1, "Quantity must be at least 1"),
    }))
        .min(1, "At least one item is required"),
    shippingAddress: zod_1.z.object({
        name: zod_1.z.string().min(2, "Name must be at least 2 characters"),
        phone: zod_1.z.string().min(10, "Phone must be at least 10 characters"),
        address: zod_1.z.string().min(10, "Address must be at least 10 characters"),
        city: zod_1.z.string().min(2, "City must be at least 2 characters"),
        postalCode: zod_1.z.string().min(5, "Postal code must be at least 5 characters"),
    }),
    whatsappPhoneNumber: zod_1.z
        .string()
        .min(10, "WhatsApp number must be at least 10 characters")
        .regex(/^[0-9+\-\s()]+$/, "Invalid phone number format"),
    notes: zod_1.z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});
exports.updateWhatsAppOrderStatusSchema = zod_1.z.object({
    status: zod_1.z.enum([
        "WHATSAPP_PENDING",
        "WHATSAPP_CONFIRMED",
        "PENDING",
        "SHIPPED",
        "COMPLETED",
        "CANCELLED",
    ]),
    adminNotes: zod_1.z
        .string()
        .max(500, "Admin notes cannot exceed 500 characters")
        .optional(),
});
exports.createAddressSchema = zod_1.z.object({
    label: zod_1.z
        .string()
        .min(2, "Label must be at least 2 characters")
        .max(50, "Label cannot exceed 50 characters")
        .optional(),
    detail: zod_1.z
        .string()
        .min(10, "Address detail must be at least 10 characters")
        .max(500, "Address detail cannot exceed 500 characters"),
    city: zod_1.z
        .string()
        .min(2, "City must be at least 2 characters")
        .max(100, "City cannot exceed 100 characters"),
    province: zod_1.z
        .string()
        .min(2, "Province must be at least 2 characters")
        .max(100, "Province cannot exceed 100 characters"),
    postalCode: zod_1.z
        .string()
        .regex(/^\d{5}(-\d{4})?$/, "Invalid postal code format")
        .optional(),
    latitude: zod_1.z
        .number()
        .min(-90, "Latitude must be between -90 and 90")
        .max(90, "Latitude must be between -90 and 90")
        .optional(),
    longitude: zod_1.z
        .number()
        .min(-180, "Longitude must be between -180 and 180")
        .max(180, "Longitude must be between -180 and 180")
        .optional(),
});
// ========================================
// 💳 PAYMENT VALIDATION SCHEMAS
// ========================================
exports.createPaymentSchema = zod_1.z.object({
    orderId: zod_1.z.string().uuid("Invalid order ID"),
    amount: zod_1.z
        .number()
        .positive("Amount must be positive")
        .min(0.01, "Amount must be at least 0.01"),
    method: zod_1.z.enum(["MIDTRANS", "BANK_TRANSFER", "CASH_ON_DELIVERY"]),
    currency: zod_1.z
        .string()
        .length(3, "Currency must be 3 characters")
        .default("IDR"),
});
exports.updatePaymentStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["PENDING", "CANCELLED", "EXPIRED", "SUCCEEDED"]),
});
// ========================================
// 🔔 NOTIFICATION VALIDATION SCHEMAS
// ========================================
exports.notificationQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1, "Page must be at least 1").default(1),
    limit: zod_1.z.coerce
        .number()
        .int()
        .min(1, "Limit must be at least 1")
        .max(100, "Limit cannot exceed 100")
        .default(10),
    isRead: zod_1.z.coerce.boolean().optional(),
    type: zod_1.z
        .enum([
        "ORDER_UPDATE",
        "ORDER_SHIPPED",
        "ORDER_DELIVERED",
        "ORDER_CANCELLED",
        "PRODUCT_LAUNCH",
        "WISHLIST_UPDATE",
        "FLASH_SALE",
        "STOCK_ALERT",
        "STOCK_CRITICAL",
        "STOCK_OUT",
    ])
        .optional(),
});
exports.markAsReadSchema = zod_1.z.object({
    notificationId: zod_1.z.string().uuid("Invalid notification ID").optional(),
    markAll: zod_1.z.boolean().default(false),
});
// ========================================
// 📊 DASHBOARD VALIDATION SCHEMAS
// ========================================
exports.dashboardQuerySchema = zod_1.z
    .object({
    startDate: zod_1.z.coerce.date().optional(),
    endDate: zod_1.z.coerce.date().optional(),
})
    .refine((data) => {
    if (data.startDate && data.endDate) {
        return data.startDate <= data.endDate;
    }
    return true;
}, {
    message: "Start date must be before or equal to end date",
    path: ["endDate"],
});
// ========================================
// ⭐ REVIEW VALIDATION SCHEMAS
// ========================================
exports.createReviewSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid("Invalid product ID"),
    rating: zod_1.z
        .number()
        .int("Rating must be an integer")
        .min(1, "Rating must be at least 1")
        .max(5, "Rating cannot exceed 5"),
    comment: zod_1.z
        .string()
        .min(10, "Comment must be at least 10 characters")
        .max(1000, "Comment cannot exceed 1000 characters"),
});
// ========================================
// ❤️ WISHLIST VALIDATION SCHEMAS
// ========================================
exports.toggleWishlistSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid("Invalid product ID"),
});
// ========================================
// 🔍 PARAMS VALIDATION SCHEMAS
// ========================================
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid("Invalid ID format"),
});
exports.productIdParamSchema = zod_1.z.object({
    productId: zod_1.z.string().min(1, "Product ID is required"),
});
exports.orderIdParamSchema = zod_1.z.object({
    orderId: zod_1.z.string().uuid("Invalid order ID"),
});
exports.paymentIdParamSchema = zod_1.z.object({
    paymentId: zod_1.z.string().uuid("Invalid payment ID"),
});
exports.categoryIdParamSchema = zod_1.z.object({
    categoryId: zod_1.z.string().uuid("Invalid category ID"),
});
// ========================================
// 📋 PAGINATION VALIDATION SCHEMAS
// ========================================
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1, "Page must be at least 1").default(1),
    limit: zod_1.z.coerce
        .number()
        .int()
        .min(1, "Limit must be at least 1")
        .max(100, "Limit cannot exceed 100")
        .default(10),
});
// ========================================
// 👑 ADMIN VALIDATION SCHEMAS
// ========================================
exports.createAdminSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name cannot exceed 50 characters")
        .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
    email: zod_1.z
        .string()
        .email("Invalid email format")
        .min(5, "Email too short")
        .max(100, "Email too long"),
    password: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password too long")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one lowercase letter, one uppercase letter, and one number"),
});
exports.createStaffSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name cannot exceed 50 characters")
        .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
    email: zod_1.z
        .string()
        .email("Invalid email format")
        .min(5, "Email too short")
        .max(100, "Email too long"),
    password: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password too long")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one lowercase letter, one uppercase letter, and one number"),
});
// ========================================
// 📦 INVENTORY VALIDATION SCHEMAS
// ========================================
exports.inventoryLogQuerySchema = zod_1.z
    .object({
    productId: zod_1.z.string().uuid("Invalid product ID").optional(),
    page: zod_1.z.coerce.number().int().min(1, "Page must be at least 1").default(1),
    limit: zod_1.z.coerce
        .number()
        .int()
        .min(1, "Limit must be at least 1")
        .max(100, "Limit cannot exceed 100")
        .default(20),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
    changeType: zod_1.z.enum(["increase", "decrease", "all"]).default("all"),
})
    .refine((data) => {
    if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
}, {
    message: "Start date must be before or equal to end date",
    path: ["endDate"],
});
exports.createInventoryLogSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid("Invalid product ID"),
    change: zod_1.z
        .number()
        .int("Change must be an integer")
        .refine((val) => val !== 0, "Change cannot be zero"),
    note: zod_1.z.string().max(500, "Note cannot exceed 500 characters").optional(),
});
exports.lowStockQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1, "Page must be at least 1").default(1),
    limit: zod_1.z.coerce
        .number()
        .int()
        .min(1, "Limit must be at least 1")
        .max(100, "Limit cannot exceed 100")
        .default(10),
    status: zod_1.z.enum(["low", "critical", "out_of_stock"]).optional(),
});
// ========================================
// 🔔 CUSTOMER NOTIFICATION SCHEMAS
// ========================================
exports.productLaunchNotificationSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid("Invalid product ID"),
    title: zod_1.z.string().max(100, "Title cannot exceed 100 characters").optional(),
    message: zod_1.z
        .string()
        .max(500, "Message cannot exceed 500 characters")
        .optional(),
});
exports.wishlistNotificationSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid("Invalid product ID"),
    notificationType: zod_1.z.enum(["BACK_IN_STOCK", "DISCOUNT", "PRICE_DROP"]),
});
exports.flashSaleNotificationSchema = zod_1.z.object({
    productIds: zod_1.z
        .array(zod_1.z.string().uuid("Invalid product ID"))
        .min(1, "At least one product ID is required"),
    discountPercentage: zod_1.z
        .number()
        .min(1, "Discount must be at least 1%")
        .max(100, "Discount cannot exceed 100%"),
    endTime: zod_1.z.string().datetime("Invalid end time format"),
});
// ========================================
// 🚚 SHIPMENT VALIDATION SCHEMAS
// ========================================
exports.createShipmentSchema = zod_1.z.object({
    orderId: zod_1.z.string().uuid("Invalid order ID"),
    trackingNumber: zod_1.z
        .string()
        .min(3, "Tracking number must be at least 3 characters")
        .optional(),
    carrier: zod_1.z
        .string()
        .min(2, "Carrier must be at least 2 characters")
        .max(50, "Carrier cannot exceed 50 characters"),
    method: zod_1.z.enum(["STANDARD", "EXPRESS", "OVERNIGHT", "SAME_DAY"]),
    cost: zod_1.z.number().min(0, "Cost must be non-negative").optional(),
});
exports.updateShipmentSchema = zod_1.z.object({
    trackingNumber: zod_1.z
        .string()
        .min(3, "Tracking number must be at least 3 characters")
        .optional(),
    carrier: zod_1.z
        .string()
        .min(2, "Carrier must be at least 2 characters")
        .max(50, "Carrier cannot exceed 50 characters")
        .optional(),
    cost: zod_1.z.number().min(0, "Cost must be non-negative").optional(),
    estimatedDays: zod_1.z
        .number()
        .int()
        .min(1, "Estimated days must be at least 1")
        .optional(),
});
exports.shipmentQuerySchema = zod_1.z.object({
    orderId: zod_1.z.string().uuid("Invalid order ID").optional(),
    carrier: zod_1.z.string().optional(),
    page: zod_1.z.coerce.number().int().min(1, "Page must be at least 1").default(1),
    limit: zod_1.z.coerce
        .number()
        .int()
        .min(1, "Limit must be at least 1")
        .max(100, "Limit cannot exceed 100")
        .default(10),
    startDate: zod_1.z.string().datetime("Invalid start date").optional(),
    endDate: zod_1.z.string().datetime("Invalid end date").optional(),
});
exports.shipmentIdParamSchema = zod_1.z.object({
    shipmentId: zod_1.z.string().uuid("Invalid shipment ID"),
});
exports.trackingNumberParamSchema = zod_1.z.object({
    trackingNumber: zod_1.z
        .string()
        .min(3, "Tracking number must be at least 3 characters"),
});
// ========================================
// 📂 CATEGORY VALIDATION SCHEMAS
// ========================================
exports.createCategorySchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(2, "Category name must be at least 2 characters")
        .max(50, "Category name cannot exceed 50 characters")
        .regex(/^[a-zA-Z0-9\s\-&]+$/, "Category name can only contain letters, numbers, spaces, hyphens, and ampersands"),
    description: zod_1.z
        .string()
        .max(500, "Description cannot exceed 500 characters")
        .optional(),
    image: zod_1.z.string().min(1, "Image URL cannot be empty").optional(),
});
exports.updateCategorySchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(2, "Category name must be at least 2 characters")
        .max(50, "Category name cannot exceed 50 characters")
        .regex(/^[a-zA-Z0-9\s\-&]+$/, "Category name can only contain letters, numbers, spaces, hyphens, and ampersands")
        .optional(),
    description: zod_1.z
        .string()
        .max(500, "Description cannot exceed 500 characters")
        .optional(),
    image: zod_1.z.string().min(1, "Image URL cannot be empty").optional(),
});
exports.categoryQuerySchema = zod_1.z.object({
    page: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
    includeProducts: zod_1.z
        .string()
        .transform((val) => val === "true")
        .optional(),
});
// ========================================
// 📊 ANALYTICS VALIDATION SCHEMAS
// ========================================
exports.analyticsQuerySchema = zod_1.z.object({
    period: zod_1.z.string().optional().default("30"),
});
// ========================================
// 📋 REPORTS VALIDATION SCHEMAS
// ========================================
exports.reportsQuerySchema = zod_1.z.object({
    page: zod_1.z.string().optional().default("1"),
    limit: zod_1.z.string().optional().default("10"),
    search: zod_1.z.string().optional(),
    type: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
});
exports.generateReportSchema = zod_1.z.object({
    type: zod_1.z.enum(["SALES", "INVENTORY", "CUSTOMER", "PRODUCT"]),
    period: zod_1.z.string().min(1, "Period is required"),
    format: zod_1.z.enum(["PDF", "EXCEL", "CSV"]).optional().default("PDF"),
});
exports.reportIdParamSchema = zod_1.z.object({
    reportId: zod_1.z.string().min(1, "Report ID is required"),
});
// ========================================
// 🎯 DEAL VALIDATION SCHEMAS
// ========================================
exports.createDealSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Title is required").max(100, "Title too long"),
    description: zod_1.z.string().max(500, "Description too long").optional(),
    type: zod_1.z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FLASH_SALE"]),
    value: zod_1.z.number().min(0, "Value must be positive"),
    startDate: zod_1.z.string().datetime("Invalid start date format"),
    endDate: zod_1.z.string().datetime("Invalid end date format"),
    image: zod_1.z.string().optional().or(zod_1.z.literal("")),
    images: zod_1.z.array(zod_1.z.string().url("Invalid image URL")).optional(),
    isFlashSale: zod_1.z.boolean().optional().default(false),
    maxUses: zod_1.z.number().int().min(1, "Max uses must be at least 1").optional(),
    // Product information for auto-creation
    productName: zod_1.z
        .string()
        .min(1, "Product name is required")
        .max(100, "Product name too long"),
    productDescription: zod_1.z
        .string()
        .max(1000, "Product description too long")
        .optional(),
    productPrice: zod_1.z.number().min(0.01, "Product price must be at least 0.01"),
    productSku: zod_1.z
        .string()
        .min(3, "SKU must be at least 3 characters")
        .max(50, "SKU too long")
        .optional(),
    productStock: zod_1.z.number().int().min(0, "Stock cannot be negative").default(0),
    categoryId: zod_1.z.string().uuid("Invalid category ID").optional(),
});
exports.updateDealSchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .min(1, "Title is required")
        .max(100, "Title too long")
        .optional(),
    description: zod_1.z.string().max(500, "Description too long").optional(),
    type: zod_1.z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FLASH_SALE"]).optional(),
    value: zod_1.z.number().min(0, "Value must be positive").optional(),
    startDate: zod_1.z.string().datetime("Invalid start date format").optional(),
    endDate: zod_1.z.string().datetime("Invalid end date format").optional(),
    image: zod_1.z.string().optional().or(zod_1.z.literal("")),
    images: zod_1.z.array(zod_1.z.string().url("Invalid image URL")).optional(),
    isFlashSale: zod_1.z.boolean().optional(),
    maxUses: zod_1.z.number().int().min(1, "Max uses must be at least 1").optional(),
    status: zod_1.z.enum(["ACTIVE", "INACTIVE", "EXPIRED"]).optional(),
});
exports.dealQuerySchema = zod_1.z.object({
    status: zod_1.z.enum(["ACTIVE", "INACTIVE", "EXPIRED"]).optional(),
    isFlashSale: zod_1.z.boolean().optional(),
    page: zod_1.z
        .string()
        .regex(/^\d+$/, "Page must be a number")
        .transform(Number)
        .optional(),
    limit: zod_1.z
        .string()
        .regex(/^\d+$/, "Limit must be a number")
        .transform(Number)
        .optional(),
    includeExpired: zod_1.z
        .string()
        .optional()
        .transform((val) => val === "true")
        .or(zod_1.z.boolean().optional()),
});
exports.dealIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid("Invalid deal ID"),
});
// ========================================
// ⚙️ SETTINGS VALIDATION SCHEMAS
// ========================================
exports.updateSettingsSchema = zod_1.z.object({
    // General Settings
    siteName: zod_1.z.string().optional(),
    siteDescription: zod_1.z.string().optional(),
    siteUrl: zod_1.z.string().url().optional(),
    adminEmail: zod_1.z.string().email().optional(),
    timezone: zod_1.z.string().optional(),
    language: zod_1.z.string().optional(),
    currency: zod_1.z.string().optional(),
    // Email Settings
    smtpHost: zod_1.z.string().optional(),
    smtpPort: zod_1.z.string().optional(),
    smtpUsername: zod_1.z.string().optional(),
    smtpPassword: zod_1.z.string().optional(),
    emailFrom: zod_1.z.string().optional(),
    // Security Settings
    sessionTimeout: zod_1.z.number().optional(),
    maxLoginAttempts: zod_1.z.number().optional(),
    passwordMinLength: zod_1.z.number().optional(),
    twoFactorAuth: zod_1.z.boolean().optional(),
    ipWhitelist: zod_1.z.string().optional(),
    userLoginRateLimit: zod_1.z.number().min(1).max(10000).optional(),
    // Notification Settings
    emailNotifications: zod_1.z.boolean().optional(),
    smsNotifications: zod_1.z.boolean().optional(),
    pushNotifications: zod_1.z.boolean().optional(),
    lowStockAlert: zod_1.z.boolean().optional(),
    newOrderAlert: zod_1.z.boolean().optional(),
    paymentAlert: zod_1.z.boolean().optional(),
    // Payment Settings
    stripeEnabled: zod_1.z.boolean().optional(),
    paypalEnabled: zod_1.z.boolean().optional(),
    bankTransferEnabled: zod_1.z.boolean().optional(),
    codEnabled: zod_1.z.boolean().optional(),
    // Shipping Settings
    freeShippingThreshold: zod_1.z.number().optional(),
    defaultShippingCost: zod_1.z.number().optional(),
    shippingZones: zod_1.z.string().optional(),
    // Appearance Settings
    primaryColor: zod_1.z.string().optional(),
    secondaryColor: zod_1.z.string().optional(),
    logoUrl: zod_1.z.string().optional(),
    faviconUrl: zod_1.z.string().optional(),
});
// ========================================
// 🎯 EXPORT ALL SCHEMAS
// ========================================
exports.validationSchemas = {
    // Auth
    register: exports.registerSchema,
    login: exports.loginSchema,
    forgotPassword: exports.forgotPasswordSchema,
    resetPassword: exports.resetPasswordSchema,
    googleToken: exports.googleTokenSchema,
    // User
    createUser: exports.createUserSchema,
    updateUser: exports.updateUserSchema,
    userQuery: exports.userQuerySchema,
    // Product
    createProduct: exports.createProductSchema,
    updateProduct: exports.updateProductSchema,
    productQuery: exports.productQuerySchema,
    // Order
    createOrder: exports.createOrderSchema,
    updateOrderStatus: exports.updateOrderStatusSchema,
    orderQuery: exports.orderQuerySchema,
    // Address
    createAddress: exports.createAddressSchema,
    // Payment
    createPayment: exports.createPaymentSchema,
    updatePaymentStatus: exports.updatePaymentStatusSchema,
    // Notification
    notificationQuery: exports.notificationQuerySchema,
    markAsRead: exports.markAsReadSchema,
    // Dashboard
    dashboardQuery: exports.dashboardQuerySchema,
    // Review
    createReview: exports.createReviewSchema,
    // Wishlist
    toggleWishlist: exports.toggleWishlistSchema,
    // Params
    idParam: exports.idParamSchema,
    productIdParam: exports.productIdParamSchema,
    orderIdParam: exports.orderIdParamSchema,
    paymentIdParam: exports.paymentIdParamSchema,
    categoryIdParam: exports.categoryIdParamSchema,
    // Common
    pagination: exports.paginationSchema,
    // Admin
    createAdmin: exports.createAdminSchema,
    createStaff: exports.createStaffSchema,
    // Inventory
    inventoryLogQuery: exports.inventoryLogQuerySchema,
    createInventoryLog: exports.createInventoryLogSchema,
    lowStockQuery: exports.lowStockQuerySchema,
    // Shipment
    createShipment: exports.createShipmentSchema,
    updateShipment: exports.updateShipmentSchema,
    shipmentQuery: exports.shipmentQuerySchema,
    shipmentIdParam: exports.shipmentIdParamSchema,
    trackingNumberParam: exports.trackingNumberParamSchema,
    // Category
    createCategory: exports.createCategorySchema,
    updateCategory: exports.updateCategorySchema,
    categoryQuery: exports.categoryQuerySchema,
    // Analytics
    analyticsQuery: exports.analyticsQuerySchema,
    // Reports
    reportsQuery: exports.reportsQuerySchema,
    generateReport: exports.generateReportSchema,
    reportIdParam: exports.reportIdParamSchema,
    // Settings
    updateSettings: exports.updateSettingsSchema,
    // Deal
    createDeal: exports.createDealSchema,
    updateDeal: exports.updateDealSchema,
    dealQuery: exports.dealQuerySchema,
    dealIdParam: exports.dealIdParamSchema,
};
