"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const bcrypt_1 = require("bcrypt");
const createUserService = async (input) => {
    const { name, email, password, role = "CUSTOMER" } = input;
    // Check existing user
    const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new Error("Email already registered");
    }
    // Hash password
    const salt = await (0, bcrypt_1.genSalt)(10);
    const hashedPassword = await (0, bcrypt_1.hash)(password, salt);
    // Create user
    const newUser = await prisma_1.default.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role,
            isVerified: false,
            isDeleted: false,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isVerified: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return newUser;
};
exports.createUserService = createUserService;
