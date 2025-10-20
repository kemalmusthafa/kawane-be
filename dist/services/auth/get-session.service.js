"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionService = void 0;
// services/auth/get-session.service.ts
const prisma_1 = __importDefault(require("../../prisma"));
const getSessionService = async (input) => {
    const { userId } = input;
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            avatar: true,
            isVerified: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    if (!user)
        throw new Error("User not found");
    return user;
};
exports.getSessionService = getSessionService;
