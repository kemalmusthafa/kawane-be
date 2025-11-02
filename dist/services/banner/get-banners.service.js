"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBannersService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const getBannersService = async (params = {}) => {
    const { isActive, includeInactive = false } = params;
    const where = {};
    // Filter by active status if specified
    if (isActive !== undefined) {
        where.isActive = isActive;
    }
    else if (!includeInactive) {
        // Default: only show active banners
        where.isActive = true;
    }
    const banners = await prisma_1.default.banner.findMany({
        where,
        orderBy: [
            { priority: "asc" },
            { createdAt: "desc" },
        ],
    });
    return banners;
};
exports.getBannersService = getBannersService;
