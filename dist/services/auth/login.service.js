"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = require("jsonwebtoken");
const config_1 = require("../../utils/config");
const loginService = async (input) => {
    const { email, password } = input;
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user)
        throw new Error("Incorrect email or password!");
    if (user.isDeleted) {
        throw new Error("This account has been deleted. Please contact support");
    }
    // 🚨 Handle OAuth-only users
    if (!user.password) {
        throw new Error("This account was created using Google. Please login via Google!");
    }
    // 🚨 Prevent login with wrong method
    if (user.avatar && user.avatar.includes("googleusercontent.com")) {
        throw new Error("Please login using your Google account!");
    }
    // ✅ Password check
    const isPasswordValid = await (0, bcrypt_1.compare)(password, user.password);
    if (!isPasswordValid)
        throw new Error("Incorrect email or password!");
    // Generate JWT - Fix type issue dengan type assertion
    const payload = { id: user.id, role: user.role };
    const token = (0, jsonwebtoken_1.sign)(payload, config_1.appConfig.JWT_SECRET, {
        expiresIn: "120m", // Use hardcoded value temporarily
    });
    return {
        message: "Login successfully",
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            avatar: user.avatar,
        },
    };
};
exports.loginService = loginService;
