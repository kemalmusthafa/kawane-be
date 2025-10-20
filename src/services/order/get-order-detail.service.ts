import prisma from "../../prisma";

interface GetOrderDetailParams {
  orderId: string;
  userId: string;
}

export const getOrderDetailService = async (params: GetOrderDetailParams) => {
  const { orderId, userId } = params;

  // First check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) throw new Error("User not found");

  // Get order with all related data
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: true,
              category: true,
              sizes: true, // ✅ Include product sizes
            },
          },
        },
      },
      payment: true,
      shipment: {
        include: {
          address: true,
        },
      },
      address: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!order) throw new Error("Order not found");

  // Check if user owns this order (for security)
  if (order.userId !== userId) {
    throw new Error("Access denied: You can only view your own orders");
  }

  // Transform order items to include size information and fallbacks
  const transformedItems = order.items.map((item) => {
    // If size is null, try to determine the most likely size that was ordered
    let sizeInfo = item.size;
    let availableSizes = null;

    if (!item.size && item.product.sizes && item.product.sizes.length > 0) {
      // Get available sizes for reference
      availableSizes = item.product.sizes.map((ps) => ({
        size: ps.size,
        stock: ps.stock,
      }));

      // Determine the most likely size that was ordered
      // Priority: M > L > S > XL > XXL > XS > SM
      const sizePriority = ["M", "L", "S", "XL", "XXL", "XS", "SM"];
      const availableSizeNames = item.product.sizes.map((ps) => ps.size);

      // Find the first available size in priority order
      const mostLikelySize = sizePriority.find((size) =>
        availableSizeNames.includes(size)
      );

      if (mostLikelySize) {
        sizeInfo = mostLikelySize; // Show the most likely size
      } else {
        // If no priority size found, use the first available
        sizeInfo = availableSizeNames[0] || "Unknown";
      }
    }

    return {
      ...item,
      size: sizeInfo, // Use actual size or most likely size
      availableSizes, // Include available sizes for reference
      productName: item.product.name, // Add product name for easier access
    };
  });

  // Transform order to match frontend expectations
  const transformedOrder = {
    id: order.id,
    orderNumber: order.id, // Use ID as order number for now
    status: order.status.toLowerCase(),
    paymentStatus: order.payment?.status?.toLowerCase() || "pending",
    totalAmount: order.totalAmount,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: transformedItems, // ✅ Use transformed items with size info
    payment: order.payment,
    shipment: order.shipment,
    address: order.address,
    customer: {
      id: order.user.id,
      name: order.user.name || "Unknown Customer",
      email: order.user.email,
    },
  };

  // Debug: Log order items to see if size is included
  console.log(
    "📦 Order items from database:",
    order.items.map((item) => ({
      id: item.id,
      productName: item.product.name,
      quantity: item.quantity,
      size: item.size,
    }))
  );

  // Debug: Log transformed items with size determination
  console.log(
    "📦 Transformed order items:",
    transformedItems.map((item) => ({
      id: item.id,
      productName: item.productName,
      quantity: item.quantity,
      size: item.size,
      availableSizes:
        item.availableSizes?.map((s) => s.size).join(", ") || "None",
      sizeDetermination: item.availableSizes
        ? "Smart fallback applied"
        : "Original size",
    }))
  );

  return transformedOrder;
};
