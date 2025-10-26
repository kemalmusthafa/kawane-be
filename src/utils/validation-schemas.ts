import { z } from "zod";

// ========================================
// 🔐 AUTHENTICATION VALIDATION SCHEMAS
// ========================================

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),

  email: z
    .string()
    .email("Invalid email format")
    .min(5, "Email too short")
    .max(100, "Email too long"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password too long")
    .regex(
      /^(?=.*[a-z])(?=.*\d)/,
      "Password must contain at least one lowercase letter and one number"
    ),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password too long"),
});

export const googleTokenSchema = z.object({
  code: z.string().min(1, "Google authorization code is required"),
});

// ========================================
// 👥 USER VALIDATION SCHEMAS
// ========================================

export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),

  email: z.string().email("Invalid email format"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),

  role: z.enum(["CUSTOMER", "STAFF", "ADMIN"]).optional().default("CUSTOMER"),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .optional(),

  email: z.string().email("Invalid email format").optional(),

  phone: z
    .string()
    .regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone number format")
    .optional(),

  avatar: z.string().url("Invalid avatar URL").optional(),

  role: z.enum(["CUSTOMER", "STAFF", "ADMIN"]).optional(),

  isVerified: z.boolean().optional(),
});

export const userQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(10),
});

// ========================================
// 🛍️ PRODUCT VALIDATION SCHEMAS
// ========================================

export const createProductSchema = z.object({
  name: z
    .string()
    .min(3, "Product name must be at least 3 characters")
    .max(100, "Product name cannot exceed 100 characters"),

  description: z
    .string()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional(),

  price: z
    .number()
    .positive("Price must be positive")
    .min(0.01, "Price must be at least 0.01"),

  // sku: z
  //   .string()
  //   .min(3, "SKU must be at least 3 characters")
  //   .max(50, "SKU cannot exceed 50 characters")
  //   .optional(),

  stock: z
    .number()
    .int("Stock must be an integer")
    .min(0, "Stock cannot be negative")
    .default(0),

  categoryId: z.string().uuid("Invalid category ID").optional(),

  sizes: z
    .array(
      z.object({
        size: z
          .string()
          .min(1, "Size is required")
          .max(20, "Size cannot exceed 20 characters"),
        stock: z
          .number()
          .int("Stock must be an integer")
          .min(0, "Stock cannot be negative")
          .default(0),
      })
    )
    .optional(),

  images: z.array(z.string().url("Invalid image URL")).optional(),
});

export const updateProductSchema = z.object({
  name: z
    .string()
    .min(3, "Product name must be at least 3 characters")
    .max(100, "Product name cannot exceed 100 characters")
    .optional(),

  description: z
    .string()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional(),

  price: z
    .number()
    .positive("Price must be positive")
    .min(0.01, "Price must be at least 0.01")
    .optional(),

  stock: z
    .number()
    .int("Stock must be an integer")
    .min(0, "Stock cannot be negative")
    .optional(),

  categoryId: z.string().min(1, "Category ID cannot be empty").optional(),

  sizes: z
    .array(
      z.object({
        size: z
          .string()
          .min(1, "Size is required")
          .max(20, "Size cannot exceed 20 characters"),
        stock: z
          .number()
          .int("Stock must be an integer")
          .min(0, "Stock cannot be negative")
          .default(0),
      })
    )
    .optional(),

  images: z.array(z.string().url("Invalid image URL")).optional(),
});

export const productQuerySchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().min(1, "Category ID is required").optional(),
  status: z.enum(["active", "out_of_stock", "inactive"]).optional(),
  inStock: z.coerce.boolean().optional(),
  minPrice: z.coerce.number().positive("Min price must be positive").optional(),
  maxPrice: z.coerce.number().positive("Max price must be positive").optional(),
  page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(10),
  sortBy: z.enum(["name", "price", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// ========================================
// 🛒 CART VALIDATION SCHEMAS
// ========================================

export const addToCartSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .positive("Quantity must be positive")
    .min(1, "Quantity must be at least 1")
    .max(100, "Quantity cannot exceed 100"),
  size: z.string().optional(),
});

export const addDealToCartSchema = z.object({
  dealId: z.string().uuid("Invalid deal ID"),
  productId: z.string().uuid("Invalid product ID"),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .positive("Quantity must be positive")
    .min(1, "Quantity must be at least 1")
    .max(100, "Quantity cannot exceed 100"),
});

export const updateCartItemSchema = z.object({
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .positive("Quantity must be positive")
    .min(1, "Quantity must be at least 1")
    .max(100, "Quantity cannot exceed 100"),
});

export const cartItemIdParamSchema = z.object({
  cartItemId: z.string().uuid("Invalid cart item ID"),
});

// ========================================
// 🛒 ORDER VALIDATION SCHEMAS
// ========================================

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid("Invalid product ID"),
        quantity: z
          .number()
          .int("Quantity must be an integer")
          .positive("Quantity must be positive")
          .min(1, "Quantity must be at least 1"),
        size: z.string().optional(), // ✅ Added size field
      })
    )
    .min(1, "At least one item is required"),

  totalAmount: z
    .number()
    .positive("Total amount must be positive")
    .min(0.01, "Total amount must be at least 0.01")
    .optional(),

  shippingAddress: z
    .string()
    .min(10, "Shipping address must be at least 10 characters")
    .max(500, "Shipping address cannot exceed 500 characters"),

  paymentMethod: z
    .enum(["WHATSAPP_MANUAL", "BANK_TRANSFER", "CASH_ON_DELIVERY"])
    .default("WHATSAPP_MANUAL"),

  addressId: z.string().uuid("Invalid address ID").optional().nullable(),

  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
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

export const orderQuerySchema = z.object({
  status: z
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
  paymentStatus: z
    .enum(["PENDING", "SUCCEEDED", "FAILED", "CANCELLED"])
    .optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(10),
});

// ========================================
// 📱 WHATSAPP ORDER VALIDATION SCHEMAS
// ========================================

export const createWhatsAppOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid("Invalid product ID"),
        quantity: z
          .number()
          .int("Quantity must be an integer")
          .positive("Quantity must be positive")
          .min(1, "Quantity must be at least 1"),
      })
    )
    .min(1, "At least one item is required"),

  shippingAddress: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    phone: z.string().min(10, "Phone must be at least 10 characters"),
    address: z.string().min(10, "Address must be at least 10 characters"),
    city: z.string().min(2, "City must be at least 2 characters"),
    postalCode: z.string().min(5, "Postal code must be at least 5 characters"),
  }),

  whatsappPhoneNumber: z
    .string()
    .min(10, "WhatsApp number must be at least 10 characters")
    .regex(/^[0-9+\-\s()]+$/, "Invalid phone number format"),

  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});

export const updateWhatsAppOrderStatusSchema = z.object({
  status: z.enum([
    "WHATSAPP_PENDING",
    "WHATSAPP_CONFIRMED",
    "PENDING",
    "SHIPPED",
    "COMPLETED",
    "CANCELLED",
  ]),
  adminNotes: z
    .string()
    .max(500, "Admin notes cannot exceed 500 characters")
    .optional(),
});

export const createAddressSchema = z.object({
  label: z
    .string()
    .min(2, "Label must be at least 2 characters")
    .max(50, "Label cannot exceed 50 characters")
    .optional(),

  detail: z
    .string()
    .min(10, "Address detail must be at least 10 characters")
    .max(500, "Address detail cannot exceed 500 characters"),

  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(100, "City cannot exceed 100 characters"),

  province: z
    .string()
    .min(2, "Province must be at least 2 characters")
    .max(100, "Province cannot exceed 100 characters"),

  postalCode: z
    .string()
    .regex(/^\d{5}(-\d{4})?$/, "Invalid postal code format")
    .optional(),

  latitude: z
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90")
    .optional(),

  longitude: z
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180")
    .optional(),
});

// ========================================
// 💳 PAYMENT VALIDATION SCHEMAS
// ========================================

export const createPaymentSchema = z.object({
  orderId: z.string().uuid("Invalid order ID"),
  amount: z
    .number()
    .positive("Amount must be positive")
    .min(0.01, "Amount must be at least 0.01"),

  method: z.enum(["MIDTRANS", "BANK_TRANSFER", "CASH_ON_DELIVERY"]),
  currency: z
    .string()
    .length(3, "Currency must be 3 characters")
    .default("IDR"),
});

export const updatePaymentStatusSchema = z.object({
  status: z.enum(["PENDING", "CANCELLED", "EXPIRED", "SUCCEEDED"]),
});

// ========================================
// 🔔 NOTIFICATION VALIDATION SCHEMAS
// ========================================

export const notificationQuerySchema = z.object({
  page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(10),
  isRead: z.coerce.boolean().optional(),
  type: z
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

export const markAsReadSchema = z.object({
  notificationId: z.string().uuid("Invalid notification ID").optional(),
  markAll: z.boolean().default(false),
});

// ========================================
// 📊 DASHBOARD VALIDATION SCHEMAS
// ========================================

export const dashboardQuerySchema = z
  .object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.startDate <= data.endDate;
      }
      return true;
    },
    {
      message: "Start date must be before or equal to end date",
      path: ["endDate"],
    }
  );

// ========================================
// ⭐ REVIEW VALIDATION SCHEMAS
// ========================================

export const createReviewSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  rating: z
    .number()
    .int("Rating must be an integer")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),

  comment: z
    .string()
    .min(10, "Comment must be at least 10 characters")
    .max(1000, "Comment cannot exceed 1000 characters"),
});

// ========================================
// ❤️ WISHLIST VALIDATION SCHEMAS
// ========================================

export const toggleWishlistSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
});

// ========================================
// 🔍 PARAMS VALIDATION SCHEMAS
// ========================================

export const idParamSchema = z.object({
  id: z.string().uuid("Invalid ID format"),
});

export const productIdParamSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
});

export const orderIdParamSchema = z.object({
  orderId: z.string().uuid("Invalid order ID"),
});

export const paymentIdParamSchema = z.object({
  paymentId: z.string().uuid("Invalid payment ID"),
});

export const categoryIdParamSchema = z.object({
  categoryId: z.string().uuid("Invalid category ID"),
});

// ========================================
// 📋 PAGINATION VALIDATION SCHEMAS
// ========================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(10),
});

// ========================================
// 👑 ADMIN VALIDATION SCHEMAS
// ========================================

export const createAdminSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),

  email: z
    .string()
    .email("Invalid email format")
    .min(5, "Email too short")
    .max(100, "Email too long"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password too long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
});

export const createStaffSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),

  email: z
    .string()
    .email("Invalid email format")
    .min(5, "Email too short")
    .max(100, "Email too long"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password too long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
});

// ========================================
// 📦 INVENTORY VALIDATION SCHEMAS
// ========================================

export const inventoryLogQuerySchema = z
  .object({
    productId: z.string().uuid("Invalid product ID").optional(),
    page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
    limit: z.coerce
      .number()
      .int()
      .min(1, "Limit must be at least 1")
      .max(100, "Limit cannot exceed 100")
      .default(20),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    changeType: z.enum(["increase", "decrease", "all"]).default("all"),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: "Start date must be before or equal to end date",
      path: ["endDate"],
    }
  );

export const createInventoryLogSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  change: z
    .number()
    .int("Change must be an integer")
    .refine((val) => val !== 0, "Change cannot be zero"),
  note: z.string().max(500, "Note cannot exceed 500 characters").optional(),
});

export const lowStockQuerySchema = z.object({
  page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(10),
  status: z.enum(["low", "critical", "out_of_stock"]).optional(),
});

// ========================================
// 🔔 CUSTOMER NOTIFICATION SCHEMAS
// ========================================

export const productLaunchNotificationSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  title: z.string().max(100, "Title cannot exceed 100 characters").optional(),
  message: z
    .string()
    .max(500, "Message cannot exceed 500 characters")
    .optional(),
});

export const wishlistNotificationSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  notificationType: z.enum(["BACK_IN_STOCK", "DISCOUNT", "PRICE_DROP"]),
});

export const flashSaleNotificationSchema = z.object({
  productIds: z
    .array(z.string().uuid("Invalid product ID"))
    .min(1, "At least one product ID is required"),
  discountPercentage: z
    .number()
    .min(1, "Discount must be at least 1%")
    .max(100, "Discount cannot exceed 100%"),
  endTime: z.string().datetime("Invalid end time format"),
});

// ========================================
// 🚚 SHIPMENT VALIDATION SCHEMAS
// ========================================

export const createShipmentSchema = z.object({
  orderId: z.string().uuid("Invalid order ID"),
  trackingNumber: z
    .string()
    .min(3, "Tracking number must be at least 3 characters")
    .optional(),
  carrier: z
    .string()
    .min(2, "Carrier must be at least 2 characters")
    .max(50, "Carrier cannot exceed 50 characters"),
  method: z.enum(["STANDARD", "EXPRESS", "OVERNIGHT", "SAME_DAY"]),
  cost: z.number().min(0, "Cost must be non-negative").optional(),
});

export const updateShipmentSchema = z.object({
  trackingNumber: z
    .string()
    .min(3, "Tracking number must be at least 3 characters")
    .optional(),
  carrier: z
    .string()
    .min(2, "Carrier must be at least 2 characters")
    .max(50, "Carrier cannot exceed 50 characters")
    .optional(),
  cost: z.number().min(0, "Cost must be non-negative").optional(),
  estimatedDays: z
    .number()
    .int()
    .min(1, "Estimated days must be at least 1")
    .optional(),
});

export const shipmentQuerySchema = z.object({
  orderId: z.string().uuid("Invalid order ID").optional(),
  carrier: z.string().optional(),
  page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(10),
  startDate: z.string().datetime("Invalid start date").optional(),
  endDate: z.string().datetime("Invalid end date").optional(),
});

export const shipmentIdParamSchema = z.object({
  shipmentId: z.string().uuid("Invalid shipment ID"),
});

export const trackingNumberParamSchema = z.object({
  trackingNumber: z
    .string()
    .min(3, "Tracking number must be at least 3 characters"),
});

// ========================================
// 📂 CATEGORY VALIDATION SCHEMAS
// ========================================

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name cannot exceed 50 characters")
    .regex(
      /^[a-zA-Z0-9\s\-&]+$/,
      "Category name can only contain letters, numbers, spaces, hyphens, and ampersands"
    ),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  image: z.string().min(1, "Image URL cannot be empty").optional(),
});

export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(50, "Category name cannot exceed 50 characters")
    .regex(
      /^[a-zA-Z0-9\s\-&]+$/,
      "Category name can only contain letters, numbers, spaces, hyphens, and ampersands"
    )
    .optional(),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  image: z.string().min(1, "Image URL cannot be empty").optional(),
});

export const categoryQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  includeProducts: z
    .string()
    .transform((val) => val === "true")
    .optional(),
});

// ========================================
// 📊 ANALYTICS VALIDATION SCHEMAS
// ========================================

export const analyticsQuerySchema = z.object({
  period: z.string().optional().default("30"),
});

// ========================================
// 📋 REPORTS VALIDATION SCHEMAS
// ========================================

export const reportsQuerySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
  search: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
});

export const generateReportSchema = z.object({
  type: z.enum(["SALES", "INVENTORY", "CUSTOMER", "PRODUCT"]),
  period: z.string().min(1, "Period is required"),
  format: z.enum(["PDF", "EXCEL", "CSV"]).optional().default("PDF"),
});

export const reportIdParamSchema = z.object({
  reportId: z.string().min(1, "Report ID is required"),
});

// ========================================
// 🎯 DEAL VALIDATION SCHEMAS
// ========================================

export const createDealSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().max(500, "Description too long").optional(),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FLASH_SALE"]),
  value: z.number().min(0, "Value must be positive"),
  startDate: z.string().datetime("Invalid start date format"),
  endDate: z.string().datetime("Invalid end date format"),
  image: z.string().optional().or(z.literal("")),
  images: z.array(z.string().url("Invalid image URL")).optional(),
  isFlashSale: z.boolean().optional().default(false),
  maxUses: z.number().int().min(1, "Max uses must be at least 1").optional(),
  // Product information for auto-creation
  productName: z
    .string()
    .min(1, "Product name is required")
    .max(100, "Product name too long"),
  productDescription: z
    .string()
    .max(1000, "Product description too long")
    .optional(),
  productPrice: z.number().min(0.01, "Product price must be at least 0.01"),
  productSku: z
    .string()
    .min(3, "SKU must be at least 3 characters")
    .max(50, "SKU too long")
    .optional(),
  productStock: z.number().int().min(0, "Stock cannot be negative").default(0),
  categoryId: z.string().uuid("Invalid category ID").optional(),
});

export const updateDealSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title too long")
    .optional(),
  description: z.string().max(500, "Description too long").optional(),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FLASH_SALE"]).optional(),
  value: z.number().min(0, "Value must be positive").optional(),
  startDate: z.string().datetime("Invalid start date format").optional(),
  endDate: z.string().datetime("Invalid end date format").optional(),
  image: z.string().optional().or(z.literal("")),
  images: z.array(z.string().url("Invalid image URL")).optional(),
  isFlashSale: z.boolean().optional(),
  maxUses: z.number().int().min(1, "Max uses must be at least 1").optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "EXPIRED"]).optional(),
});

export const dealQuerySchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "EXPIRED"]).optional(),
  isFlashSale: z.boolean().optional(),
  page: z
    .string()
    .regex(/^\d+$/, "Page must be a number")
    .transform(Number)
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/, "Limit must be a number")
    .transform(Number)
    .optional(),
  includeExpired: z
    .string()
    .optional()
    .transform((val) => val === "true")
    .or(z.boolean().optional()),
});

export const dealIdParamSchema = z.object({
  id: z.string().uuid("Invalid deal ID"),
});

// ========================================
// ⚙️ SETTINGS VALIDATION SCHEMAS
// ========================================

export const updateSettingsSchema = z.object({
  // General Settings
  siteName: z.string().optional(),
  siteDescription: z.string().optional(),
  siteUrl: z.string().url().optional(),
  adminEmail: z.string().email().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  currency: z.string().optional(),

  // Email Settings
  smtpHost: z.string().optional(),
  smtpPort: z.string().optional(),
  smtpUsername: z.string().optional(),
  smtpPassword: z.string().optional(),
  emailFrom: z.string().optional(),

  // Security Settings
  sessionTimeout: z.number().optional(),
  maxLoginAttempts: z.number().optional(),
  passwordMinLength: z.number().optional(),
  twoFactorAuth: z.boolean().optional(),
  ipWhitelist: z.string().optional(),
  userLoginRateLimit: z.number().min(1).max(10000).optional(),

  // Notification Settings
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  lowStockAlert: z.boolean().optional(),
  newOrderAlert: z.boolean().optional(),
  paymentAlert: z.boolean().optional(),

  // Payment Settings
  stripeEnabled: z.boolean().optional(),
  paypalEnabled: z.boolean().optional(),
  bankTransferEnabled: z.boolean().optional(),
  codEnabled: z.boolean().optional(),

  // Shipping Settings
  freeShippingThreshold: z.number().optional(),
  defaultShippingCost: z.number().optional(),
  shippingZones: z.string().optional(),

  // Appearance Settings
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
});

// ========================================
// 🎯 EXPORT ALL SCHEMAS
// ========================================

export const validationSchemas = {
  // Auth
  register: registerSchema,
  login: loginSchema,
  forgotPassword: forgotPasswordSchema,
  resetPassword: resetPasswordSchema,
  googleToken: googleTokenSchema,

  // User
  createUser: createUserSchema,
  updateUser: updateUserSchema,
  userQuery: userQuerySchema,

  // Product
  createProduct: createProductSchema,
  updateProduct: updateProductSchema,
  productQuery: productQuerySchema,

  // Order
  createOrder: createOrderSchema,
  updateOrderStatus: updateOrderStatusSchema,
  orderQuery: orderQuerySchema,

  // Address
  createAddress: createAddressSchema,

  // Payment
  createPayment: createPaymentSchema,
  updatePaymentStatus: updatePaymentStatusSchema,

  // Notification
  notificationQuery: notificationQuerySchema,
  markAsRead: markAsReadSchema,

  // Dashboard
  dashboardQuery: dashboardQuerySchema,

  // Review
  createReview: createReviewSchema,

  // Wishlist
  toggleWishlist: toggleWishlistSchema,

  // Params
  idParam: idParamSchema,
  productIdParam: productIdParamSchema,
  orderIdParam: orderIdParamSchema,
  paymentIdParam: paymentIdParamSchema,
  categoryIdParam: categoryIdParamSchema,

  // Common
  pagination: paginationSchema,

  // Admin
  createAdmin: createAdminSchema,
  createStaff: createStaffSchema,

  // Inventory
  inventoryLogQuery: inventoryLogQuerySchema,
  createInventoryLog: createInventoryLogSchema,
  lowStockQuery: lowStockQuerySchema,

  // Shipment
  createShipment: createShipmentSchema,
  updateShipment: updateShipmentSchema,
  shipmentQuery: shipmentQuerySchema,
  shipmentIdParam: shipmentIdParamSchema,
  trackingNumberParam: trackingNumberParamSchema,

  // Category
  createCategory: createCategorySchema,
  updateCategory: updateCategorySchema,
  categoryQuery: categoryQuerySchema,

  // Analytics
  analyticsQuery: analyticsQuerySchema,

  // Reports
  reportsQuery: reportsQuerySchema,
  generateReport: generateReportSchema,
  reportIdParam: reportIdParamSchema,

  // Settings
  updateSettings: updateSettingsSchema,

  // Deal
  createDeal: createDealSchema,
  updateDeal: updateDealSchema,
  dealQuery: dealQuerySchema,
  dealIdParam: dealIdParamSchema,
};
