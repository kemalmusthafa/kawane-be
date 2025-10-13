"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserIdService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const getUserIdService = async (id) => {
    const user = await prisma_1.default.user.findUnique({
        where: { id },
    });
    if (!user) {
        throw new Error("User not found");
    }
    return user;
};
exports.getUserIdService = getUserIdService;
