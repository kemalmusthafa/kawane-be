import prisma from "../../prisma";

interface CreateNotificationData {
  userId: string;
  title: string;
  description: string;
  type?: string;
  priority?: string;
  url?: string;
  data?: any;
}

export const createNotificationService = async (
  data: CreateNotificationData
) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        description: data.description,
        type: data.type || "INFO",
        priority: data.priority || "MEDIUM",
        url: data.url,
        data: data.data ? JSON.stringify(data.data) : null,
      },
      include: {
        user: true,
      },
    });

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

export const createWhatsAppOrderNotificationService = async (
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

    // Create notification for admin
    const adminUsers = await prisma.user.findMany({
      where: {
        role: { in: ["ADMIN", "STAFF"] },
      },
    });

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
          totalAmount: order.totalAmount,
          itemCount: order.items.length,
        },
      });
      notifications.push(notification);
    }

    // Create notification for customer
    const customerNotification = await createNotificationService({
      userId: order.userId,
      title: "✅ Order Created Successfully",
      description: `Your WhatsApp order has been created successfully. Order ID: ${order.whatsappOrderId}`,
      type: "ORDER_UPDATE",
      priority: "MEDIUM",
      url: `/account/orders/${orderId}`,
      data: {
        orderId: orderId,
        whatsappOrderId: order.whatsappOrderId,
        status: "WHATSAPP_PENDING",
      },
    });

    return {
      adminNotifications: notifications,
      customerNotification: customerNotification,
    };
  } catch (error) {
    console.error("Error creating WhatsApp order notification:", error);
    throw error;
  }
};

export const createOrderStatusUpdateNotificationService = async (
  orderId: string,
  newStatus: string,
  adminNotes?: string
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

    switch (newStatus) {
      case "WHATSAPP_CONFIRMED":
        title = "✅ Order Confirmed";
        description = `Your order ${order.whatsappOrderId} has been confirmed by admin. Payment instructions will be sent via WhatsApp.`;
        priority = "HIGH";
        break;
      case "PENDING":
        title = "⏳ Order Processing";
        description = `Your order ${order.whatsappOrderId} is being processed.`;
        break;
      case "SHIPPED":
        title = "🚚 Order Shipped";
        description = `Your order ${order.whatsappOrderId} has been shipped! Track your package for delivery updates.`;
        priority = "HIGH";
        break;
      case "COMPLETED":
        title = "🎉 Order Delivered";
        description = `Your order ${order.whatsappOrderId} has been delivered successfully! Thank you for shopping with us.`;
        priority = "HIGH";
        break;
      case "CANCELLED":
        title = "❌ Order Cancelled";
        description = `Your order ${
          order.whatsappOrderId
        } has been cancelled. ${adminNotes || ""}`;
        priority = "HIGH";
        break;
      default:
        title = "📋 Order Update";
        description = `Your order ${order.whatsappOrderId} status has been updated to ${newStatus}.`;
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
        status: newStatus,
        adminNotes: adminNotes,
      },
    });

    return customerNotification;
  } catch (error) {
    console.error("Error creating order status update notification:", error);
    throw error;
  }
};

export const createPaymentConfirmationNotificationService = async (
  orderId: string
) => {
  try {
    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        payment: true,
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // Create notification for customer
    const customerNotification = await createNotificationService({
      userId: order.userId,
      title: "💳 Payment Confirmed",
      description: `Payment for order ${order.whatsappOrderId} has been confirmed. Your order is now being processed.`,
      type: "PAYMENT_UPDATE",
      priority: "HIGH",
      url: `/account/orders/${orderId}`,
      data: {
        orderId: orderId,
        whatsappOrderId: order.whatsappOrderId,
        paymentAmount: order.payment?.amount,
        paymentMethod: order.payment?.method,
      },
    });

    return customerNotification;
  } catch (error) {
    console.error("Error creating payment confirmation notification:", error);
    throw error;
  }
};

export const getUnreadNotificationCountService = async (userId: string) => {
  try {
    const count = await prisma.notification.count({
      where: {
        userId: userId,
        isRead: false,
        isDeleted: false,
      },
    });

    return count;
  } catch (error) {
    console.error("Error getting unread notification count:", error);
    throw error;
  }
};

export const markNotificationAsReadService = async (
  userId: string,
  notificationId?: string,
  markAll?: boolean
) => {
  try {
    if (markAll) {
      // Mark all notifications as read for user
      await prisma.notification.updateMany({
        where: {
          userId: userId,
          isRead: false,
          isDeleted: false,
        },
        data: {
          isRead: true,
        },
      });
    } else if (notificationId) {
      // Mark specific notification as read
      await prisma.notification.update({
        where: {
          id: notificationId,
          userId: userId, // Ensure user can only mark their own notifications
        },
        data: {
          isRead: true,
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};












