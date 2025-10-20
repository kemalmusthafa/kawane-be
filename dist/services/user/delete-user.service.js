"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreUserService = exports.hardDeleteUserService = exports.softDeleteUserService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
// Soft delete user
const softDeleteUserService = async (id) => {
    const user = await prisma_1.default.user.findUnique({ where: { id } });
    if (!user) {
        throw new Error("User not found");
    }
    if (user.isDeleted) {
        return { message: "User already soft-deleted" };
    }
    await prisma_1.default.user.update({
        where: { id },
        data: {
            isDeleted: true,
            deletedAt: new Date(),
        },
    });
    return { message: "User soft-deleted successfully" };
};
exports.softDeleteUserService = softDeleteUserService;
// Hard delete user
const hardDeleteUserService = async (id) => {
    const user = await prisma_1.default.user.findUnique({ where: { id } });
    if (!user) {
        throw new Error("User not found");
    }
    await prisma_1.default.user.delete({
        where: { id },
    });
    return { message: "User hard-deleted successfully" };
};
exports.hardDeleteUserService = hardDeleteUserService;
// Restore user (opsional)
const restoreUserService = async (id) => {
    const user = await prisma_1.default.user.findUnique({ where: { id } });
    if (!user) {
        throw new Error("User not found");
    }
    if (!user.isDeleted) {
        return { message: "User is already active" };
    }
    await prisma_1.default.user.update({
        where: { id },
        data: {
            isDeleted: false,
            deletedAt: null,
        },
    });
    return { message: "User restored successfully" };
};
exports.restoreUserService = restoreUserService;
