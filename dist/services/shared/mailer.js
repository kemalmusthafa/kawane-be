"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../../utils/config");
// Create real email transporter for production
const createRealTransporter = () => {
    if (!config_1.appConfig.MAIL_USER || !config_1.appConfig.MAIL_PASS) {
        return null;
    }
    return nodemailer_1.default.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: config_1.appConfig.MAIL_USER,
            pass: config_1.appConfig.MAIL_PASS,
        },
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        rateDelta: 20000,
        rateLimit: 5,
    });
};
// Mock email transporter for development
const mockTransporter = {
    sendMail: async (mailOptions) => {
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
        callback(null, true);
    },
};
// Choose transporter based on environment and credentials
const realTransporter = createRealTransporter();
exports.transporter = realTransporter || mockTransporter;
if (realTransporter) {
    // Verify connection
    realTransporter.verify((error, success) => {
        if (error) {
            console.error("Email transporter verification failed:", error);
        }
    });
}
