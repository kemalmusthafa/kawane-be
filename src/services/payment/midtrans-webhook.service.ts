import { PrismaClient, PaymentStatus, OrderStatus } from "@prisma/client";
import { MidtransService } from "./midtrans.service";
import crypto from "crypto";
import { appConfig } from "../../utils/config";

const prisma = new PrismaClient();

export interface MidtransWebhookData {
  order_id: string;
  status_code: string;
  status_message: string;
  transaction_status: string;
  fraud_status: string;
  payment_type: string;
  transaction_time: string;
  transaction_id: string;
  gross_amount: string;
  currency: string;
  signature_key?: string;
  _bypassSignature?: boolean; // Development flag to bypass signature verification
}

// Function to verify Midtrans webhook signature
function verifyMidtransSignature(webhookData: MidtransWebhookData): boolean {
  // Bypass signature verification for development
  if (webhookData._bypassSignature) {
    console.warn("Development mode: bypassing signature verification");
    return true;
  }

  if (!appConfig.MIDTRANS_SERVER_KEY) {
    console.warn(
      "Midtrans server key not configured, skipping signature verification"
    );
    return true; // Allow in development
  }

  const { order_id, status_code, gross_amount, signature_key } = webhookData;

  if (!signature_key) {
    console.warn("No signature key provided in webhook data");
    return false;
  }

  // Create signature string
  const signatureString = `${order_id}${status_code}${gross_amount}${appConfig.MIDTRANS_SERVER_KEY}`;
  const expectedSignature = crypto
    .createHash("sha512")
    .update(signatureString)
    .digest("hex");

  const isValid = signature_key === expectedSignature;

  if (!isValid) {
    console.error("Invalid webhook signature:", {
      received: signature_key,
      expected: expectedSignature,
      order_id,
      status_code,
      gross_amount,
    });
  }

  return isValid;
}

export async function handleMidtransWebhook(webhookData: MidtransWebhookData) {
  try {
    console.log(
      "📨 Received Midtrans webhook:",
      JSON.stringify(webhookData, null, 2)
    );

    // Verify webhook signature for security
    if (!verifyMidtransSignature(webhookData)) {
      console.error("❌ Invalid webhook signature, rejecting request");
      return { success: false, message: "Invalid webhook signature" };
    }

    const { order_id, transaction_status, transaction_id, gross_amount } =
      webhookData;

    // Find the payment by order ID
    const payment = await prisma.payment.findFirst({
      where: { orderId: order_id },
      include: {
        order: {
          include: { user: true },
        },
      },
    });

    if (!payment) {
      console.error(`Payment not found for order ID: ${order_id}`);
      return { success: false, message: "Payment not found" };
    }

    // Map Midtrans transaction status to our PaymentStatus
    let paymentStatus: PaymentStatus;
    let orderStatus: OrderStatus;

    switch (transaction_status) {
      case "capture":
      case "settlement":
        paymentStatus = PaymentStatus.SUCCEEDED;
        orderStatus = OrderStatus.COMPLETED;
        break;
      case "pending":
        paymentStatus = PaymentStatus.PENDING;
        orderStatus = OrderStatus.PENDING;
        break;
      case "cancel":
      case "deny":
      case "expire":
        paymentStatus = PaymentStatus.CANCELLED;
        orderStatus = OrderStatus.CANCELLED;
        break;
      case "refund":
        paymentStatus = PaymentStatus.CANCELLED;
        orderStatus = OrderStatus.CANCELLED;
        break;
      default:
        console.warn(`Unknown transaction status: ${transaction_status}`);
        paymentStatus = PaymentStatus.PENDING;
        orderStatus = OrderStatus.PENDING;
    }

    // Update payment and order status in a transaction
    const updatedPayment = await prisma.$transaction(async (tx) => {
      // Update payment
      const updatedPaymentResult = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: paymentStatus,
          transactionId: transaction_id || payment.transactionId,
        },
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

      // Update order status
      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: orderStatus },
      });

      // 🔄 Handle stock restoration for failed payments
      if (
        paymentStatus === PaymentStatus.CANCELLED &&
        payment.status !== PaymentStatus.CANCELLED
      ) {
        // Restore stock for all items in the cancelled order
        for (const item of updatedPaymentResult.order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });

          // Create inventory log for stock restoration
          await tx.inventoryLog.create({
            data: {
              productId: item.productId,
              change: item.quantity,
              note: `Order ${payment.orderId}: Stock restored due to payment failure`,
            },
          });
        }
      }

      return updatedPaymentResult;
    });

    // Create notification for customer
    const statusMessages = {
      [PaymentStatus.SUCCEEDED]: "Payment successful",
      [PaymentStatus.CANCELLED]: "Payment cancelled",
      [PaymentStatus.PENDING]: "Payment pending",
    };

    await prisma.notification.create({
      data: {
        userId: payment.order.userId,
        title: "Payment Status Updated",
        description: `${statusMessages[paymentStatus]} for order #${order_id}`,
        url: `/orders/${order_id}`,
      },
    });

    console.log(
      `✅ Payment status updated for order ${order_id}: ${paymentStatus} -> ${orderStatus}`
    );

    // Log successful webhook processing
    console.log("📊 Webhook Processing Summary:", {
      orderId: order_id,
      transactionId: transaction_id,
      transactionStatus: transaction_status,
      paymentStatus,
      orderStatus,
      grossAmount: gross_amount,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      message: "Payment status updated successfully",
      data: {
        orderId: order_id,
        paymentStatus,
        orderStatus,
        transactionId: transaction_id,
        grossAmount: gross_amount,
      },
    };
  } catch (error: any) {
    console.error("❌ Midtrans webhook error:", {
      error: error.message,
      stack: error.stack,
      webhookData,
      timestamp: new Date().toISOString(),
    });

    // Log error details for debugging
    console.error("🔍 Error Details:", {
      orderId: webhookData?.order_id,
      transactionStatus: webhookData?.transaction_status,
      errorType: error.constructor.name,
      errorMessage: error.message,
    });

    return {
      success: false,
      message: error.message || "Failed to process webhook",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    };
  }
}
