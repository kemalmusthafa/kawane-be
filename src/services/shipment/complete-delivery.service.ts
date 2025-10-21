import prisma from "../../prisma";

interface CompleteDeliveryData {
  shipmentId: string;
  deliveryDate?: Date;
  notes?: string;
}

export const completeDeliveryService = async (data: CompleteDeliveryData) => {
  try {
    // Check if shipment exists
    const shipment = await prisma.shipment.findUnique({
      where: { id: data.shipmentId },
      include: {
        order: {
          include: {
            user: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!shipment) {
      throw new Error("Shipment not found");
    }

    // Update order status to COMPLETED
    await prisma.order.update({
      where: { id: shipment.orderId },
      data: {
        status: "COMPLETED",
        updatedAt: new Date(),
      },
    });

    // Create notification for customer about delivery completion
    await prisma.notification.create({
      data: {
        userId: shipment.order.userId,
        title: "🎉 Order Delivered!",
        description: `Your order #${shipment.order.id
          .substring(0, 8)
          .toUpperCase()} has been delivered successfully! Thank you for shopping with us.`,
        url: `/orders/${shipment.order.id}`,
        type: "shipping",
        priority: "high",
      },
    });

    return {
      message: "Delivery completed successfully",
      order: {
        id: shipment.order.id,
        status: "COMPLETED",
        user: shipment.order.user,
        items: shipment.order.items,
      },
    };
  } catch (error: any) {
    console.error("❌ Complete delivery failed:", error);
    throw new Error(error.message || "Failed to complete delivery");
  }
};









