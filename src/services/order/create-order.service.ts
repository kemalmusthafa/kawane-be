import prisma from "../../prisma";
import { getMultipleProductsPriceWithDeals } from "../deal/get-product-price-with-deal.service";
import { PaymentMethod } from "@prisma/client";
import { StockMonitoringService } from "../inventory/stock-monitoring.service";

interface OrderItemData {
  productId: string;
  quantity: number;
  size?: string;
}

interface CreateOrderData {
  userId: string;
  items: OrderItemData[];
  addressId: string;
  discountCode?: string;
  totalAmount?: number; // Added totalAmount support
  paymentMethod?: string; // Added paymentMethod support
}

export const createOrderService = async (data: CreateOrderData) => {
  // Debug: Log incoming order data
  console.log(
    "🛒 Creating order with items:",
    data.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      size: item.size,
    }))
  );

  const user = await prisma.user.findUnique({
    where: { id: data.userId },
  });
  if (!user) throw new Error("User not found");

  // Handle address - if addressId is provided, use it; otherwise throw error
  let addressId = data.addressId;
  let address = null;

  if (!addressId) {
    throw new Error("Address ID is required");
  }

  address = await prisma.address.findUnique({
    where: { id: addressId, userId: data.userId },
  });

  if (!address) {
    throw new Error("Address not found");
  }

  let discount = null;
  if (data.discountCode) {
    discount = await prisma.discount.findUnique({
      where: { code: data.discountCode },
    });
    if (!discount) throw new Error("Invalid discount code");

    const now = new Date();
    if (discount.validFrom && now < discount.validFrom) {
      throw new Error("Discount code not yet valid");
    }
    if (discount.validTo && now > discount.validTo) {
      throw new Error("Discount code has expired");
    }
    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
      throw new Error("Discount code usage limit exceeded");
    }
  }

  const products = await prisma.product.findMany({
    where: {
      id: { in: data.items.map((item) => item.productId) },
    },
  });

  if (products.length !== data.items.length) {
    throw new Error("Some products not found");
  }

  // Get product prices with deals
  const productIds = data.items.map((item) => item.productId);
  const productPrices = await getMultipleProductsPriceWithDeals(productIds);
  const priceMap = new Map(
    productPrices.map((price) => [price.productId, price])
  );

  const orderItems: Array<{
    productId: string;
    quantity: number;
    price: number;
    size?: string;
    originalPrice?: number;
    dealId?: string;
    dealTitle?: string;
    discountAmount?: number;
    discountPercentage?: number;
  }> = [];
  let calculatedTotalAmount = 0;

  for (const item of data.items) {
    const product = products.find((p) => p.id === item.productId)!;
    const priceInfo = priceMap.get(item.productId);

    // 🔍 Enhanced stock validation
    if (product.stock < item.quantity) {
      throw new Error(
        `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
      );
    }

    if (item.quantity <= 0) {
      throw new Error(
        `Invalid quantity for ${product.name}. Quantity must be greater than 0`
      );
    }

    // 🔍 Validate deal expiration
    if (priceInfo && priceInfo.dealId) {
      const deal = await prisma.deal.findUnique({
        where: { id: priceInfo.dealId },
      });

      if (!deal || deal.status !== "ACTIVE" || deal.endDate < new Date()) {
        throw new Error(
          `Deal for ${product.name} has expired. Please remove from cart and try again.`
        );
      }
    }

    // Use deal price if available, otherwise use original price
    const finalPrice = priceInfo ? priceInfo.discountedPrice : product.price;
    const itemTotal = finalPrice * item.quantity;
    calculatedTotalAmount += itemTotal;

    orderItems.push({
      productId: item.productId,
      quantity: item.quantity,
      price: finalPrice,
      size: item.size,
      originalPrice: priceInfo ? priceInfo.originalPrice : undefined,
      dealId: priceInfo?.dealId,
      dealTitle: priceInfo?.dealTitle,
      discountAmount: priceInfo ? priceInfo.discountAmount : 0,
      discountPercentage: priceInfo ? priceInfo.discountPercentage : 0,
    });
  }

  // Use provided totalAmount if available, otherwise use calculated amount
  const totalAmount = data.totalAmount || calculatedTotalAmount;

  let finalAmount = totalAmount;
  if (discount) {
    if (discount.percentage) {
      finalAmount = totalAmount * (1 - discount.percentage / 100);
    } else if (discount.amount) {
      finalAmount = Math.max(0, totalAmount - discount.amount);
    }
  }

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        userId: data.userId,
        addressId: addressId,
        totalAmount: finalAmount,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
        user: true,
      },
    });

    for (const item of data.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });

      await tx.inventoryLog.create({
        data: {
          productId: item.productId,
          change: -item.quantity,
          note: `Order ${newOrder.id}: Sale`,
        },
      });
    }

    // Create notification for admin about new order
    const adminUsers = await tx.user.findMany({
      where: {
        role: { in: ["ADMIN", "STAFF"] },
      },
      select: { id: true },
    });

    const adminNotifications = adminUsers.map((admin) => ({
      userId: admin.id,
      title: "🛒 New Order Received",
      description: `New order #${newOrder.id
        .substring(0, 8)
        .toUpperCase()} from ${
        user.name
      } - Total: Rp ${finalAmount.toLocaleString("id-ID")}`,
      type: "ORDER",
      priority: "HIGH",
      url: `/admin/orders/${newOrder.id}`,
      isRead: false,
      data: JSON.stringify({
        orderId: newOrder.id,
        customerName: user.name,
        customerEmail: user.email,
        totalAmount: finalAmount,
        itemCount: data.items.length,
        orderItems: data.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      }),
    }));

    await tx.notification.createMany({
      data: adminNotifications,
    });

    if (discount) {
      await tx.discount.update({
        where: { id: discount.id },
        data: { usedCount: { increment: 1 } },
      });
    }

    return newOrder;
  });

  // Create payment record for WhatsApp manual payment
  let paymentUrl = null;
  let paymentToken = null;

  try {
    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        method:
          (data.paymentMethod as PaymentMethod) ||
          PaymentMethod.WHATSAPP_MANUAL,
        amount: order.totalAmount,
        status: "PENDING",
      },
    });

    // For WhatsApp manual payment, we don't need paymentUrl or paymentToken
    // The order will be processed manually via WhatsApp
    paymentUrl = null;
    paymentToken = null;
  } catch (error) {
    console.error("=== PAYMENT CREATION ERROR ===");
    console.error("Failed to create payment record:", error);
    console.error("Error details:", error);
    console.error("==============================");
    throw error;
  }

  // Monitor stock levels after order creation
  try {
    for (const item of data.items) {
      await StockMonitoringService.monitorSingleProduct(item.productId);
    }
  } catch (error) {
    console.error("Stock monitoring failed:", error);
    // Don't throw error here as order is already created successfully
  }

  return {
    ...order,
    paymentUrl,
    paymentToken,
  };
};
