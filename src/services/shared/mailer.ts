import nodemailer from "nodemailer";

// Mock email transporter for development
export const transporter = {
  sendMail: async (mailOptions: any) => {
    console.log("📧 Mock Email Sent:");
    console.log("📤 From:", mailOptions.from);
    console.log("📥 To:", mailOptions.to);
    console.log("📋 Subject:", mailOptions.subject);
    console.log(
      "🔗 Verification Link:",
      mailOptions.html?.match(/href="([^"]+)"/)?.[1] || "Not found"
    );

    // Simulate successful email sending with proper structure
    return {
      messageId: `mock-${Date.now()}@kawanestudio.com`,
      accepted: [mailOptions.to],
      rejected: [],
      pending: [],
      response: "250 OK",
      envelope: {
        from: mailOptions.from,
        to: [mailOptions.to],
      },
    };
  },
  verify: (callback: (error: any, success: any) => void) => {
    console.log("✅ Mock email transporter verified");
    callback(null, true);
  },
} as any;

console.log("📧 Using Mock Email Service for development");
