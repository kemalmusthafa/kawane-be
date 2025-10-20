"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdminService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const bcrypt_1 = require("bcrypt");
const createAdminService = async (input) => {
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
    // Hash password
    const hashedPassword = await (0, bcrypt_1.hash)(password, 10);
    // Create admin user
    const newAdmin = await prisma_1.default.user.create({
        data: {
            email,
            name,
            password: hashedPassword,
            role: "ADMIN",
            isVerified: true,
            isDeleted: false,
        },
    });
    return {
        message: "Admin created successfully",
        admin: {
            id: newAdmin.id,
            name: newAdmin.name,
            email: newAdmin.email,
            role: newAdmin.role,
            isVerified: newAdmin.isVerified,
        },
    };
};
exports.createAdminService = createAdminService;
