"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const handlebars_1 = __importDefault(require("handlebars"));
const mailer_1 = require("../shared/mailer");
const jsonwebtoken_1 = require("jsonwebtoken");
const bcrypt_1 = require("bcrypt");
const config_1 = require("../../utils/config");
const registerService = async (input) => {
    const { name, email, password } = input;
    // Check existing user
    const existUser = await prisma_1.default.user.findUnique({
        where: { email },
    });
    if (existUser) {
        if (existUser.isDeleted) {
            throw new Error("This email has been removed, please contact support");
        }
        throw new Error("Email already exists!");
    }
    // 🔑 Hash password jika ada
    let hashedPassword = null;
    if (password) {
        const salt = await (0, bcrypt_1.genSalt)(10);
        hashedPassword = await (0, bcrypt_1.hash)(password, salt);
    }
    // Create user
    const newUser = await prisma_1.default.user.create({
        data: {
            email,
            name,
            password: hashedPassword,
            isVerified: false,
            isDeleted: false,
            role: "CUSTOMER", // Default role
        },
    });
    // ✅ Send verification email jika register dengan password
    if (password) {
        try {
            const payload = { id: newUser.id };
            // Fix type issue dengan type assertion
            const token = (0, jsonwebtoken_1.sign)(payload, config_1.appConfig.JWT_SECRET, {
                expiresIn: "60m",
            });
            // Use production URL if available, otherwise fallback to localhost
            const baseUrl = process.env.BASE_URL_FE || "http://localhost:3000";
            const verificationLink = `${baseUrl}/verify/${token}`;
            console.log("📧 Sending verification email to:", email);
            console.log("🔗 Verification link:", verificationLink);
            const templatePath = path_1.default.resolve(__dirname, "../../templates", "verif-email.hbs");
            console.log("📁 Template path:", templatePath);
            const templateSource = fs_1.default.readFileSync(templatePath, "utf-8");
            const compiledTemplate = handlebars_1.default.compile(templateSource);
            const emailHtml = compiledTemplate({ email, verificationLink });
            const mailOptions = {
                from: "Kawane Studio <noreply@kawanestudio.com>",
                to: email,
                subject: "Welcome to Kawane Studio - Please verify your email",
                html: emailHtml,
            };
            console.log("📤 Sending email with options:", {
                from: mailOptions.from,
                to: mailOptions.to,
                subject: mailOptions.subject,
            });
            const result = await mailer_1.transporter.sendMail(mailOptions);
            console.log("✅ Email sent successfully:", result.messageId);
            return {
                message: "Verification email sent successfully",
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    isVerified: newUser.isVerified,
                },
            };
        }
        catch (emailError) {
            console.error("❌ Email sending failed:", emailError);
            // Don't fail the registration if email fails, just log the error
            return {
                message: "User registered successfully, but verification email failed to send",
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    isVerified: newUser.isVerified,
                },
                emailError: emailError instanceof Error
                    ? emailError.message
                    : "Unknown email error",
            };
        }
    }
    return {
        message: "User registered via OAuth successfully",
        user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            isVerified: newUser.isVerified,
        },
    };
};
exports.registerService = registerService;
