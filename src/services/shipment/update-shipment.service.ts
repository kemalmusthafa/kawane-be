import prisma from "../../prisma";

interface UpdateShipmentData {
  shipmentId: string;
  trackingNo?: string;
  courier?: string;
  cost?: number;
  estimatedDays?: number;
}

export const updateShipmentService = async (data: UpdateShipmentData) => {
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

    // Prepare update data
    const updateData: any = {};
    if (data.trackingNo) updateData.trackingNo = data.trackingNo;
    if (data.courier) updateData.courier = data.courier;
    if (data.cost !== undefined) updateData.cost = data.cost;
    if (data.estimatedDays !== undefined)
      updateData.estimatedDays = data.estimatedDays;

    // Update shipment
    const updatedShipment = await prisma.shipment.update({
      where: { id: data.shipmentId },
      data: updateData,
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

    // Create notification for customer about shipment update
    await prisma.notification.create({
      data: {
        userId: shipment.order.userId,
        title: "📦 Shipment Updated",
        description: `Your order #${shipment.order.id
          .substring(0, 8)
          .toUpperCase()} shipment has been updated.`,
        url: `/orders/${shipment.order.id}`,
      },
    });

    return {
      message: "Shipment updated successfully",
      shipment: {
        id: updatedShipment.id,
        orderId: updatedShipment.orderId,
        trackingNumber: updatedShipment.trackingNo,
        carrier: updatedShipment.courier,
        cost: updatedShipment.cost,
        estimatedDays: updatedShipment.estimatedDays,
        createdAt: updatedShipment.createdAt,
        order: {
          id: updatedShipment.order.id,
          status: updatedShipment.order.status,
          user: updatedShipment.order.user,
          items: updatedShipment.order.items,
        },
      },
    };
  } catch (error: any) {
    console.error("❌ Update shipment failed:", error);
    throw new Error(error.message || "Failed to update shipment");
  }
};
