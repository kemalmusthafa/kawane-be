"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = require("jsonwebtoken");
const config_1 = require("../../utils/config");
const mailer_1 = require("../shared/mailer");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const handlebars_1 = __importDefault(require("handlebars"));
class ProfileService {
    // Get user profile
    static async getUserProfile(userId) {
        try {
            const user = await prisma_1.default.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    avatar: true,
                    isVerified: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            if (!user) {
                throw new Error("User not found");
            }
            return user;
        }
        catch (error) {
            throw new Error("Failed to get user profile");
        }
    }
    // Update user profile
    static async updateProfile(userId, data) {
        try {
            const user = await prisma_1.default.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new Error("User not found");
            }
            // Check if email is being changed
            if (data.email && data.email !== user.email) {
                // Check if new email already exists
                const existingUser = await prisma_1.default.user.findUnique({
                    where: { email: data.email },
                });
                if (existingUser) {
                    throw new Error("Email already exists");
                }
                // Generate verification token for new email
                const payload = {
                    id: userId,
                    newEmail: data.email,
                    type: "email_change",
                };
                const token = (0, jsonwebtoken_1.sign)(payload, config_1.appConfig.JWT_SECRET, {
                    expiresIn: "60m",
                });
                // Send verification email
                await this.sendEmailVerificationEmail(data.email, token, user.name);
                // Update user with new email but mark as unverified
                const updatedUser = await prisma_1.default.user.update({
                    where: { id: userId },
                    data: {
                        ...data,
                        isVerified: false, // Mark as unverified when email changes
                    },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        avatar: true,
                        isVerified: true,
                        role: true,
                        updatedAt: true,
                    },
                });
                return {
                    ...updatedUser,
                    message: "Profile updated. Please verify your new email address.",
                };
            }
            // Update without email change
            const updatedUser = await prisma_1.default.user.update({
                where: { id: userId },
                data,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    avatar: true,
                    isVerified: true,
                    role: true,
                    updatedAt: true,
                },
            });
            return {
                ...updatedUser,
                message: "Profile updated successfully",
            };
        }
        catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to update profile");
        }
    }
    // Change password
    static async changePassword(userId, data) {
        try {
            const user = await prisma_1.default.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new Error("User not found");
            }
            if (!user.password) {
                throw new Error("Password not set for this account");
            }
            // Verify current password
            const isCurrentPasswordValid = await (0, bcrypt_1.compare)(data.currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                throw new Error("Current password is incorrect");
            }
            // Hash new password
            const salt = await (0, bcrypt_1.genSalt)(10);
            const hashedNewPassword = await (0, bcrypt_1.hash)(data.newPassword, salt);
            // Update password
            await prisma_1.default.user.update({
                where: { id: userId },
                data: { password: hashedNewPassword },
            });
            return { message: "Password changed successfully" };
        }
        catch (error) {
            throw new Error(error instanceof Error ? error.message : "Failed to change password");
        }
    }
    // Upload avatar
    static async updateAvatar(userId, avatarUrl) {
        try {
            const user = await prisma_1.default.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new Error("User not found");
            }
            const updatedUser = await prisma_1.default.user.update({
                where: { id: userId },
                data: { avatar: avatarUrl },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    avatar: true,
                    isVerified: true,
                    role: true,
                    updatedAt: true,
                },
            });
            return {
                ...updatedUser,
                message: "Avatar updated successfully",
            };
        }
        catch (error) {
            throw new Error("Failed to update avatar");
        }
    }
    // Send email verification for email change
    static async sendEmailVerificationEmail(email, token, userName) {
        try {
            const verificationLink = `${process.env.BASE_URL_FE}/verify-email-change/${token}`;
            const templatePath = path_1.default.resolve(__dirname, "../../templates", "verif-email.hbs");
            const templateSource = fs_1.default.readFileSync(templatePath, "utf-8");
            const compiledTemplate = handlebars_1.default.compile(templateSource);
            const emailHtml = compiledTemplate({
                email,
                verificationLink,
                userName,
            });
            await mailer_1.transporter.sendMail({
                from: "Admin <no-reply@kawane.com>",
                to: email,
                subject: "Verify your new email address - Kawane Studio",
                html: emailHtml,
            });
        }
        catch (error) {
            console.error("Failed to send verification email:", error);
            throw new Error("Failed to send verification email");
        }
    }
}
exports.ProfileService = ProfileService;
