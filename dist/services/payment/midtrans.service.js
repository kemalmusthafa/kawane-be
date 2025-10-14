"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MidtransService = void 0;
const midtrans_client_1 = __importDefault(require("midtrans-client"));
const config_1 = require("../../utils/config");
// Initialize Midtrans client
const snap = new midtrans_client_1.default.Snap({
    isProduction: config_1.appConfig.MIDTRANS_IS_PRODUCTION,
    serverKey: config_1.appConfig.MIDTRANS_SERVER_KEY || "SB-Mid-server-your-server-key",
    clientKey: config_1.appConfig.MIDTRANS_CLIENT_KEY || "SB-Mid-client-your-client-key",
});
class MidtransService {
    static async createPayment(data) {
        try {
            // Debug logging
            console.log("=== MIDTRANS DEBUG ===");
            console.log("MIDTRANS_SERVER_KEY:", config_1.appConfig.MIDTRANS_SERVER_KEY ? "SET" : "NOT SET");
            console.log("MIDTRANS_CLIENT_KEY:", config_1.appConfig.MIDTRANS_CLIENT_KEY ? "SET" : "NOT SET");
            console.log("MIDTRANS_IS_PRODUCTION:", config_1.appConfig.MIDTRANS_IS_PRODUCTION);
            console.log("Order ID:", data.orderId);
            console.log("Amount:", data.amount);
            console.log("Customer Details:", JSON.stringify(data.customerDetails, null, 2));
            console.log("Item Details:", JSON.stringify(data.itemDetails, null, 2));
            console.log("=====================");
            // Check if Midtrans keys are configured
            if (!config_1.appConfig.MIDTRANS_SERVER_KEY ||
                config_1.appConfig.MIDTRANS_SERVER_KEY === "SB-Mid-server-your-server-key") {
                console.warn("Midtrans server key not configured, returning mock payment URL");
                return {
                    token: "mock-token-" + Date.now(),
                    redirectUrl: "https://checkout.sandbox.midtrans.com/mock-payment?order_id=" +
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
        }
        catch (error) {
            console.error("Midtrans payment creation error:", error);
            throw new Error(`Failed to create Midtrans payment: ${error.message}`);
        }
    }
    static async getPaymentStatus(orderId) {
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
        }
        catch (error) {
            console.error("Midtrans payment status error:", error);
            throw new Error(`Failed to get payment status: ${error.message}`);
        }
    }
    static async cancelPayment(orderId) {
        try {
            // For now, return a mock response since the transaction API might not be available
            // In production, you would use the Midtrans API to cancel transactions
            return {
                order_id: orderId,
                status_code: "200",
                status_message: "Success",
                transaction_status: "cancel",
            };
        }
        catch (error) {
            console.error("Midtrans payment cancellation error:", error);
            throw new Error(`Failed to cancel payment: ${error.message}`);
        }
    }
}
exports.MidtransService = MidtransService;
