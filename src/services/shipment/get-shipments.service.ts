import prisma from "../../prisma";

interface GetShipmentsInput {
  userId?: string;
  orderId?: string;
  status?: string;
  carrier?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export const getShipmentsService = async (input: GetShipmentsInput) => {
  try {
    const {
      userId,
      orderId,
      status,
      carrier,
      page = 1,
      limit = 10,
      startDate,
      endDate,
    } = input;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (userId) {
      where.order = {
        userId: userId,
      };
    }

    if (orderId) {
      where.orderId = orderId;
    }

    if (carrier) {
      where.courier = {
        contains: carrier,
      };
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      where.createdAt = {
        gte: new Date(startDate),
      };
    } else if (endDate) {
      where.createdAt = {
        lte: new Date(endDate),
      };
    }

    // Get shipments with pagination
    const [shipments, total] = await Promise.all([
      prisma.shipment.findMany({
        where,
        include: {
          order: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              items: {
                include: {
                  product: {
                    select: {
                      id: true,
                      name: true,
                      sku: true,
                      price: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.shipment.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      shipments: shipments.map((shipment) => ({
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
          totalAmount: shipment.order.totalAmount,
          user: shipment.order.user,
          items: shipment.order.items,
        },
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    };
  } catch (error: any) {
    console.error("❌ Get shipments failed:", error);
    throw new Error("Failed to get shipments");
  }
};

// Get single shipment by ID
export const getShipmentByIdService = async (shipmentId: string) => {
  try {
    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    sku: true,
                    price: true,
                    images: {
                      select: {
                        url: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!shipment) {
      throw new Error("Shipment not found");
    }

    return {
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
          totalAmount: shipment.order.totalAmount,
          user: shipment.order.user,
          items: shipment.order.items,
        },
      },
    };
  } catch (error: any) {
    console.error("❌ Get shipment by ID failed:", error);
    throw new Error(error.message || "Failed to get shipment");
  }
};

// Get shipment by tracking number
export const getShipmentByTrackingService = async (trackingNumber: string) => {
  try {
    const shipment = await prisma.shipment.findFirst({
      where: { trackingNo: trackingNumber },
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    sku: true,
                    price: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!shipment) {
      throw new Error("Shipment not found");
    }

    return {
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
          totalAmount: shipment.order.totalAmount,
          user: shipment.order.user,
          items: shipment.order.items,
        },
      },
    };
  } catch (error: any) {
    console.error("❌ Get shipment by tracking failed:", error);
    throw new Error(error.message || "Failed to get shipment");
  }
};
