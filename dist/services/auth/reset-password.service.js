"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordService = void 0;
// services/auth/reset-password.service.ts
const prisma_1 = __importDefault(require("../../prisma"));
const jsonwebtoken_1 = require("jsonwebtoken");
const bcrypt_1 = require("bcrypt");
const config_1 = require("../../utils/config");
const resetPasswordService = async (input) => {
    const { token, newPassword } = input;
    try {
        // Fix type issue dengan type assertion
        const decoded = (0, jsonwebtoken_1.verify)(token, config_1.appConfig.JWT_SECRET);
        const user = await prisma_1.default.user.findUnique({ where: { id: decoded.id } });
        if (!user)
            throw new Error("Invalid or expired token");
        // Hash new password
        const salt = await (0, bcrypt_1.genSalt)(10);
        const hashedPassword = await (0, bcrypt_1.hash)(newPassword, salt);
        await prisma_1.default.user.update({
            where: { id: decoded.id },
            data: { password: hashedPassword },
        });
        return { message: "Password has been reset successfully" };
    }
    catch (error) {
        throw new Error("Invalid or expired token");
    }
};
exports.resetPasswordService = resetPasswordService;
