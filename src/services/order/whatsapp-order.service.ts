import prisma from "../../prisma";
import {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from "../../../prisma/generated/client";
import {
  createWhatsAppOrderNotificationService,
  createOrderStatusUpdateNotificationService,
  createPaymentConfirmationNotificationService,
} from "../notification/whatsapp-order-notification.service";

interface WhatsAppOrderData {
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    size?: string; // ✅ Added size field
  }>;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  whatsappPhoneNumber: string;
  notes?: string;
}

export const createWhatsAppOrderService = async (data: WhatsAppOrderData) => {
  try {
    // Debug: Log incoming WhatsApp order data
    console.log(
      "📱 Creating WhatsApp order with items:",
      data.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
      }))
    );

    // Validate user
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });
    if (!user) throw new Error("User not found");

    // Validate products and calculate total
    const products = await prisma.product.findMany({
      where: {
        id: { in: data.items.map((item) => item.productId) },
      },
      include: {
        sizes: true, // Include product sizes for size-specific stock validation
      },
    });

    if (products.length !== data.items.length) {
      throw new Error("Some products not found");
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems: Array<{
      productId: string;
      quantity: number;
      price: number;
      size?: string; // ✅ Added size field
    }> = [];

    for (const item of data.items) {
      const product = products.find((p) => p.id === item.productId)!;

      // 🔍 Enhanced stock validation - check size-specific stock if size is provided
      if (item.size) {
        // Check if product has sizes and find the specific size
        const productSize = product.sizes?.find((s) => s.size === item.size);
        if (!productSize) {
          throw new Error(
            `Size "${item.size}" not available for ${product.name}`
          );
        }

        if (productSize.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${product.name} size ${item.size}. Available: ${productSize.stock}, Requested: ${item.quantity}`
          );
        }
      } else {
        // Check general stock if no size specified
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        size: item.size, // ✅ Include size information
      });
    }

    // Generate unique WhatsApp order ID
    const whatsappOrderId = `WA-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Create order
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId: data.userId,
          totalAmount: totalAmount,
          whatsappPhoneNumber: data.whatsappPhoneNumber,
          isWhatsAppOrder: true,
          whatsappOrderId: whatsappOrderId,
          adminNotes: data.notes || "",
          status: OrderStatus.WHATSAPP_PENDING,
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
          user: true,
        },
      });

      // Decrement stock
      for (const item of data.items) {
        // Decrement size-specific stock if size is provided
        if (item.size) {
          await tx.productSize.updateMany({
            where: {
              productId: item.productId,
              size: item.size,
            },
            data: {
              stock: { decrement: item.quantity },
            },
          });
        }

        // Always decrement general product stock
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });

        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            change: -item.quantity,
            note: `WhatsApp Order ${newOrder.id}: Sale${
              item.size ? ` (Size: ${item.size})` : ""
            }`,
          },
        });
      }

      // Create payment record
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          method: PaymentMethod.WHATSAPP_MANUAL,
          amount: totalAmount,
          whatsappPhoneNumber: data.whatsappPhoneNumber,
          status: PaymentStatus.PENDING,
        },
      });

      return newOrder;
    });

    // Generate WhatsApp message
    const whatsappMessage = generateWhatsAppMessage(
      order,
      data.shippingAddress
    );

    // Update order with WhatsApp message
    await prisma.order.update({
      where: { id: order.id },
      data: { whatsappMessage: whatsappMessage },
    });

    // Create notifications
    await createWhatsAppOrderNotificationService(order.id);

    return {
      order,
      whatsappMessage,
      whatsappLink: generateWhatsAppLink(
        data.whatsappPhoneNumber,
        whatsappMessage
      ),
    };
  } catch (error) {
    console.error("Error creating WhatsApp order:", error);
    throw error;
  }
};

function generateWhatsAppMessage(order: any, shippingAddress: any): string {
  const orderItems = order.items
    .map((item: any) => {
      // Enhanced size handling for WhatsApp messages
      let sizeText = "";
      if (item.size) {
        // If size is available (either original or determined), use it
        sizeText = ` (${item.size})`;
      }

      return `• ${item.product.name}${sizeText} x${item.quantity} = Rp ${(
        item.price * item.quantity
      ).toLocaleString("id-ID")}`;
    })
    .join("\n");

  return `Halo! Saya ingin memesan produk dari Kawane Studio.

📋 Detail Pesanan:
${orderItems}

💰 Total: Rp ${order.totalAmount.toLocaleString("id-ID")}

📦 Alamat Pengiriman:
Nama: ${shippingAddress.name}
No. HP: ${shippingAddress.phone}
Alamat: ${shippingAddress.address}
Kota: ${shippingAddress.city}
Kode Pos: ${shippingAddress.postalCode}

📝 Order ID: ${order.whatsappOrderId}

Mohon konfirmasi ketersediaan dan cara pembayaran. Terima kasih! 🙏`;
}

function generateWhatsAppLink(phoneNumber: string, message: string): string {
  const cleanPhone = phoneNumber.replace(/\D/g, "");
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

export const updateWhatsAppOrderStatusService = async (
  orderId: string,
  status: OrderStatus,
  adminNotes?: string
) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true, user: true },
    });

    if (!order) throw new Error("Order not found");

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: status,
          adminNotes: adminNotes || order.adminNotes,
        },
        include: {
          payment: true,
          user: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Update payment status if order is confirmed
      if (status === OrderStatus.WHATSAPP_CONFIRMED) {
        await tx.payment.update({
          where: { orderId: orderId },
          data: {
            status: PaymentStatus.SUCCEEDED,
            adminConfirmed: true,
          },
        });
      }

      return updatedOrder;
    });

    // Create notification for status update
    await createOrderStatusUpdateNotificationService(
      orderId,
      status,
      adminNotes
    );

    return updatedOrder;
  } catch (error) {
    console.error("Error updating WhatsApp order status:", error);
    throw error;
  }
};

export const getWhatsAppOrdersService = async (status?: OrderStatus) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        isWhatsAppOrder: true,
        ...(status && { status: status }),
      },
      include: {
        user: true,
        payment: true,
        items: {
          include: {
            product: true,
          },
        },
        address: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return orders;
  } catch (error) {
    console.error("Error getting WhatsApp orders:", error);
    throw error;
  }
};
