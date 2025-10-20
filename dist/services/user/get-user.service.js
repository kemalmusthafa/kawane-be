"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const getUserService = async (query) => {
    const { search, page = 1, limit = 10 } = query;
    const filter = {
        isDeleted: false, // Only show active users
    };
    if (search) {
        filter.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
        ];
    }
    const countUser = await prisma_1.default.user.count({ where: filter });
    const total_page = Math.ceil(countUser / limit);
    const users = await prisma_1.default.user.findMany({
        where: filter,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: limit * (page - 1),
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            role: true,
            isVerified: true,
            isDeleted: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return {
        total_page,
        page,
        limit,
        total_users: countUser,
        users,
    };
};
exports.getUserService = getUserService;
