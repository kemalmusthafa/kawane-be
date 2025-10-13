"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailChangeService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const jsonwebtoken_1 = require("jsonwebtoken");
const config_1 = require("../../utils/config");
const verifyEmailChangeService = async (token) => {
    try {
        // Verify token
        const decoded = (0, jsonwebtoken_1.verify)(token, config_1.appConfig.JWT_SECRET);
        // Check if token is for email change
        if (decoded.type !== "email_change") {
            throw new Error("Invalid token type");
        }
        const userId = decoded.id;
        const newEmail = decoded.newEmail;
        if (!userId || !newEmail) {
            throw new Error("Invalid token payload");
        }
        // Check if user exists
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error("User not found");
        }
        // Check if new email is already taken by another user
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email: newEmail },
        });
        if (existingUser && existingUser.id !== userId) {
            throw new Error("Email already taken by another user");
        }
        // Update user email and mark as verified
        const updatedUser = await prisma_1.default.user.update({
            where: { id: userId },
            data: {
                email: newEmail,
                isVerified: true,
            },
        });
        return {
            message: "Email address updated and verified successfully",
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                isVerified: updatedUser.isVerified,
            },
        };
    }
    catch (error) {
        if (error instanceof Error && error.message.includes("expired")) {
            throw new Error("Verification link has expired. Please request a new one.");
        }
        throw new Error("Invalid or expired verification link");
    }
};
exports.verifyEmailChangeService = verifyEmailChangeService;
