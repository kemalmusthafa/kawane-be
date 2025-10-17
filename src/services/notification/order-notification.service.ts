import prisma from "../../prisma";
import { createNotificationService } from "./whatsapp-order-notification.service";

export const createAdminWhatsAppOrderNotificationService = async (
  orderId: string
) => {
  try {
    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // Get all admin users
    const adminUsers = await prisma.user.findMany({
      where: {
        role: { in: ["ADMIN", "STAFF"] },
      },
    });

    // Create notifications for all admins
    const notifications = [];
    for (const admin of adminUsers) {
      const notification = await createNotificationService({
        userId: admin.id,
        title: "📱 New WhatsApp Order",
        description: `New WhatsApp order from ${order.user.name} - Order ID: ${order.whatsappOrderId}`,
        type: "ORDER_UPDATE",
        priority: "HIGH",
        url: `/admin/orders/${orderId}`,
        data: {
          orderId: orderId,
          whatsappOrderId: order.whatsappOrderId,
          customerName: order.user.name,
          customerPhone: order.whatsappPhoneNumber,
          totalAmount: order.totalAmount,
          itemCount: order.items.length,
          orderItems: order.items.map((item) => ({
            productName: item.product.name,
            size: null, // Size field not available in current database
            quantity: item.quantity,
            price: item.price,
          })),
        },
      });
      notifications.push(notification);
    }

    return notifications;
  } catch (error) {
    console.error("Error creating admin WhatsApp order notification:", error);
    throw error;
  }
};

export const createCustomerOrderNotificationService = async (
  orderId: string,
  notificationType: string,
  additionalData?: any
) => {
  try {
    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    let title = "";
    let description = "";
    let priority = "MEDIUM";

    switch (notificationType) {
      case "ORDER_CREATED":
        title = "✅ Order Created Successfully";
        description = `Your WhatsApp order has been created successfully. Order ID: ${order.whatsappOrderId}`;
        priority = "HIGH";
        break;
      case "ORDER_CONFIRMED":
        title = "✅ Order Confirmed";
        description = `Your order ${order.whatsappOrderId} has been confirmed by admin. Payment instructions will be sent via WhatsApp.`;
        priority = "HIGH";
        break;
      case "ORDER_PROCESSING":
        title = "⏳ Order Processing";
        description = `Your order ${order.whatsappOrderId} is being processed.`;
        break;
      case "ORDER_SHIPPED":
        title = "🚚 Order Shipped";
        description = `Your order ${order.whatsappOrderId} has been shipped! Track your package for delivery updates.`;
        priority = "HIGH";
        break;
      case "ORDER_DELIVERED":
        title = "🎉 Order Delivered";
        description = `Your order ${order.whatsappOrderId} has been delivered successfully! Thank you for shopping with us.`;
        priority = "HIGH";
        break;
      case "ORDER_CANCELLED":
        title = "❌ Order Cancelled";
        description = `Your order ${
          order.whatsappOrderId
        } has been cancelled. ${additionalData?.reason || ""}`;
        priority = "HIGH";
        break;
      case "PAYMENT_CONFIRMED":
        title = "💳 Payment Confirmed";
        description = `Payment for order ${order.whatsappOrderId} has been confirmed. Your order is now being processed.`;
        priority = "HIGH";
        break;
      default:
        title = "📋 Order Update";
        description = `Your order ${order.whatsappOrderId} has been updated.`;
    }

    // Create notification for customer
    const customerNotification = await createNotificationService({
      userId: order.userId,
      title: title,
      description: description,
      type: "ORDER_UPDATE",
      priority: priority,
      url: `/account/orders/${orderId}`,
      data: {
        orderId: orderId,
        whatsappOrderId: order.whatsappOrderId,
        notificationType: notificationType,
        ...additionalData,
      },
    });

    return customerNotification;
  } catch (error) {
    console.error("Error creating customer order notification:", error);
    throw error;
  }
};
