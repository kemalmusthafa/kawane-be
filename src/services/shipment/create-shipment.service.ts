import prisma from "../../prisma";
import { OrderStatus } from "@prisma/client";

interface CreateShipmentData {
  orderId: string;
  trackingNumber?: string;
  carrier: string;
  method: string;
  estimatedDelivery?: Date;
  notes?: string;
  cost?: number;
  estimatedDays?: number;
}

export const createShipmentService = async (data: CreateShipmentData) => {
  try {
    // Check if order exists and is ready for shipment
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      include: {
        user: true,
        payment: true, // ✅ FIXED: Include payment data
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

    console.log("🔍 createShipmentService order found:", {
      id: order.id,
      status: order.status,
      paymentStatus: order.payment?.status,
    });

    // ✅ FIXED: More flexible order status validation using enum
    const isReadyForShipment =
      order.status === OrderStatus.PAID ||
      order.status === OrderStatus.COMPLETED ||
      order.status === OrderStatus.SHIPPED ||
      (order.status === OrderStatus.PENDING &&
        order.payment?.status === "SUCCEEDED");

    if (!isReadyForShipment) {
      console.log("❌ Order not ready for shipment:", {
        orderId: order.id,
        status: order.status,
        paymentStatus: order.payment?.status,
      });
      throw new Error("Order is not ready for shipment");
    }

    // Check if shipment already exists for this order
    const existingShipment = await prisma.shipment.findFirst({
      where: { orderId: data.orderId },
    });

    if (existingShipment) {
      throw new Error("Shipment already exists for this order");
    }

    // Generate tracking number if not provided
    const trackingNumber = data.trackingNumber || generateTrackingNumber();

    // Create shipment
    const shipment = await prisma.shipment.create({
      data: {
        orderId: data.orderId,
        trackingNo: trackingNumber,
        courier: data.carrier,
        cost: data.cost || 0, // Use provided cost or default to 0
        estimatedDays:
          data.estimatedDays ||
          (data.method === "SAME_DAY"
            ? 1
            : data.method === "EXPRESS"
            ? 2
            : data.method === "OVERNIGHT"
            ? 1
            : 3),
      },
      include: {
        order: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            items: {
              include: {
                product: { select: { id: true, name: true, sku: true } },
              },
            },
          },
        },
      },
    });

    // Update order status to SHIPPED
    await prisma.order.update({
      where: { id: data.orderId },
      data: { status: OrderStatus.SHIPPED },
    });

    // Create notification for customer
    await prisma.notification.create({
      data: {
        userId: order.userId,
        title: "📦 Order Shipped!",
        description: `Your order #${order.id
          .substring(0, 8)
          .toUpperCase()} has been shipped! Track your package with tracking number: ${trackingNumber}`,
        url: `/orders/${order.id}`,
      },
    });

    return {
      message: "Shipment created successfully",
      shipment: {
        id: shipment.id,
        orderId: shipment.orderId,
        trackingNumber: shipment.trackingNo,
        carrier: shipment.courier,
        cost: shipment.cost,
        estimatedDays: shipment.estimatedDays,
        createdAt: shipment.createdAt,
        order: {
          id: shipment.order.id,
          status: shipment.order.status,
          user: shipment.order.user,
          items: shipment.order.items,
        },
      },
    };
  } catch (error: any) {
    console.error("❌ Create shipment failed:", error);
    throw new Error(error.message || "Failed to create shipment");
  }
};

// Helper function to generate tracking number
function generateTrackingNumber(): string {
  const prefix = "KS";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}
