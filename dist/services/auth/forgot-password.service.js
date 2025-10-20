"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPasswordService = void 0;
// services/auth/forgot-password.service.ts
const prisma_1 = __importDefault(require("../../prisma"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const handlebars_1 = __importDefault(require("handlebars"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const mailer_1 = require("../shared/mailer");
const jsonwebtoken_1 = require("jsonwebtoken");
const config_1 = require("../../utils/config");
const forgotPasswordService = async (input) => {
    const { email } = input;
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user)
        throw new Error("Email not registered!");
    if (user.isDeleted) {
        throw new Error("This account has been deleted. Please contact support");
    }
    // Generate reset token
    const payload = { id: user.id };
    // Fix type issue dengan type assertion
    const token = (0, jsonwebtoken_1.sign)(payload, config_1.appConfig.JWT_SECRET, {
        expiresIn: "30m",
    });
    const resetLink = `${process.env.BASE_URL_FE}/reset-password/${token}`;
    // Load email template
    const templatePath = path_1.default.resolve(__dirname, "../../templates", "forgotPassword.hbs");
    console.log("Template path:", templatePath);
    if (!fs_1.default.existsSync(templatePath)) {
        throw new Error(`Email template not found at: ${templatePath}`);
    }
    const templateSource = fs_1.default.readFileSync(templatePath, "utf-8");
    const compiledTemplate = handlebars_1.default.compile(templateSource);
    const emailHtml = compiledTemplate({ email, resetLink });
    console.log("Sending reset password email to:", email);
    console.log("Reset link:", resetLink);
    try {
        // Send email
        const info = await mailer_1.transporter.sendMail({
            from: "Kawane Studio <no-reply@kawane.com>",
            to: email,
            subject: "Reset Your Password - Kawane Studio",
            html: emailHtml,
        });
        console.log("Email sent successfully:", info.messageId);
        console.log("Preview URL:", nodemailer_1.default.getTestMessageUrl(info));
        return {
            message: "Password reset email sent successfully",
            previewUrl: nodemailer_1.default.getTestMessageUrl(info), // For development testing
            resetLink: resetLink, // Always include reset link for development
        };
    }
    catch (error) {
        console.error("Email sending failed:", error);
        // Return reset link directly for development
        return {
            message: "Password reset email failed, but here's your reset link for testing",
            resetLink: resetLink,
        };
    }
};
exports.forgotPasswordService = forgotPasswordService;
