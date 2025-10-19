"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transporter = void 0;
// Mock email transporter for development
exports.transporter = {
    sendMail: async (mailOptions) => {
        console.log("📧 Mock Email Sent:");
        console.log("📤 From:", mailOptions.from);
        console.log("📥 To:", mailOptions.to);
        console.log("📋 Subject:", mailOptions.subject);
        console.log("🔗 Verification Link:", mailOptions.html?.match(/href="([^"]+)"/)?.[1] || "Not found");
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
    verify: (callback) => {
        console.log("✅ Mock email transporter verified");
        callback(null, true);
    },
};
console.log("📧 Using Mock Email Service for development");
