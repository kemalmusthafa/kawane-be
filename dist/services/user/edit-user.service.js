"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editUserService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const editUserService = async (id, input) => {
    const user = await prisma_1.default.user.findUnique({ where: { id } });
    if (!user) {
        throw new Error("User not found");
    }
    if (user.isDeleted) {
        throw new Error("Cannot edit deleted user");
    }
    // Check if email is being changed and if it's already taken
    if (input.email && input.email !== user.email) {
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email: input.email },
        });
        if (existingUser) {
            throw new Error("Email already taken");
        }
    }
    const updatedUser = await prisma_1.default.user.update({
        where: { id },
        data: input,
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            role: true,
            isVerified: true,
            isDeleted: true,
            updatedAt: true,
        },
    });
    return updatedUser;
};
exports.editUserService = editUserService;
