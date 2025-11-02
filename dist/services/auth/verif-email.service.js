"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailService = void 0;
// services/auth/verif-email.service.ts
const prisma_1 = __importDefault(require("../../prisma"));
const jsonwebtoken_1 = require("jsonwebtoken");
const config_1 = require("../../utils/config");
const verifyEmailService = async (token) => {
    try {
        // Fix type issue dengan type assertion
        const decoded = (0, jsonwebtoken_1.verify)(token, config_1.appConfig.JWT_SECRET);
        const user = await prisma_1.default.user.findUnique({ where: { id: decoded.id } });
        if (!user)
            throw new Error("Invalid verification token");
        if (user.isVerified) {
            return { message: "Email already verified" };
        }
        await prisma_1.default.user.update({
            where: { id: decoded.id },
            data: { isVerified: true },
        });
        return { message: "Email verified successfully" };
    }
    catch (error) {
        console.error("Verification error:", error);
        throw new Error("Invalid or expired token");
    }
};
exports.verifyEmailService = verifyEmailService;
