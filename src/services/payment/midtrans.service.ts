import Midtrans from "midtrans-client";
import { appConfig } from "../../utils/config";

// Initialize Midtrans client
const snap = new Midtrans.Snap({
  isProduction: appConfig.MIDTRANS_IS_PRODUCTION,
  serverKey: appConfig.MIDTRANS_SERVER_KEY || "SB-Mid-server-your-server-key",
  clientKey: appConfig.MIDTRANS_CLIENT_KEY || "SB-Mid-client-your-client-key",
});

export interface MidtransPaymentData {
  orderId: string;
  amount: number;
  customerDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
  };
  itemDetails: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
}

export class MidtransService {
  static async createPayment(data: MidtransPaymentData) {
    try {
      // Check if Midtrans keys are configured
      if (
        !appConfig.MIDTRANS_SERVER_KEY ||
        appConfig.MIDTRANS_SERVER_KEY === "SB-Mid-server-your-server-key"
      ) {
        console.warn(
          "Midtrans server key not configured, returning mock payment URL"
        );
        return {
          token: "mock-token-" + Date.now(),
          redirectUrl:
            "https://checkout.sandbox.midtrans.com/mock-payment?order_id=" +
            data.orderId,
        };
      }

      const parameter = {
        transaction_details: {
          order_id: data.orderId,
          gross_amount: data.amount,
        },
        customer_details: {
          first_name: data.customerDetails.firstName,
          last_name: data.customerDetails.lastName,
          email: data.customerDetails.email,
          phone: data.customerDetails.phone,
          billing_address: {
            first_name: data.customerDetails.firstName,
            last_name: data.customerDetails.lastName,
            address: data.shippingAddress.address,
            city: data.shippingAddress.city,
            postal_code: data.shippingAddress.postalCode,
            phone: data.shippingAddress.phone,
          },
          shipping_address: {
            first_name: data.shippingAddress.firstName,
            last_name: data.shippingAddress.lastName,
            address: data.shippingAddress.address,
            city: data.shippingAddress.city,
            postal_code: data.shippingAddress.postalCode,
            phone: data.shippingAddress.phone,
          },
        },
        item_details: data.itemDetails,
        callbacks: {
          finish: `https://kawane-fe.vercel.app/payment/success`,
          error: `https://kawane-fe.vercel.app/payment/error`,
          pending: `https://kawane-fe.vercel.app/payment/pending`,
        },
        // Always use webhook for production
        notification_url: `https://kawane-be.vercel.app/api/payments/midtrans-webhook`,
      };

      const response = await snap.createTransaction(parameter);

      return {
        token: response.token,
        redirectUrl: response.redirect_url,
      };
    } catch (error: any) {
      console.error("Midtrans payment creation error:", error);
      throw new Error(`Failed to create Midtrans payment: ${error.message}`);
    }
  }

  static async getPaymentStatus(orderId: string) {
    try {
      // For now, return a mock response since the transaction API might not be available
      // In production, you would use the Midtrans API to check transaction status
      return {
        order_id: orderId,
        status_code: "200",
        status_message: "Success",
        transaction_status: "pending",
        fraud_status: "accept",
        payment_type: "credit_card",
        transaction_time: new Date().toISOString(),
        transaction_id: orderId,
        gross_amount: "0",
        currency: "IDR",
      };
    } catch (error: any) {
      console.error("Midtrans payment status error:", error);
      throw new Error(`Failed to get payment status: ${error.message}`);
    }
  }

  static async cancelPayment(orderId: string) {
    try {
      // For now, return a mock response since the transaction API might not be available
      // In production, you would use the Midtrans API to cancel transactions
      return {
        order_id: orderId,
        status_code: "200",
        status_message: "Success",
        transaction_status: "cancel",
      };
    } catch (error: any) {
      console.error("Midtrans payment cancellation error:", error);
      throw new Error(`Failed to cancel payment: ${error.message}`);
    }
  }
}
