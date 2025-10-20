"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserAddressesService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const getUserAddressesService = async (params) => {
    const { userId, page = 1, limit = 10 } = params;
    const user = await prisma_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!user)
        throw new Error("User not found");
    const countAddresses = await prisma_1.default.address.count({
        where: { userId },
    });
    const totalPages = Math.ceil(countAddresses / limit);
    const addresses = await prisma_1.default.address.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: limit * (page - 1),
    });
    return {
        addresses,
        pagination: {
            page,
            limit,
            totalItems: countAddresses,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        },
    };
};
exports.getUserAddressesService = getUserAddressesService;
