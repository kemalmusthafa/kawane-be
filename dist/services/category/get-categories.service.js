"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoriesService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const getCategoriesService = async (params = {}) => {
    const { page = 1, limit = 10, includeProducts = false } = params;
    const countCategories = await prisma_1.default.category.count();
    const totalPages = Math.ceil(countCategories / limit);
    const categories = await prisma_1.default.category.findMany({
        include: {
            _count: {
                select: {
                    products: true,
                },
            },
            ...(includeProducts && {
                products: {
                    include: {
                        images: true,
                    },
                    take: 5,
                },
            }),
        },
        orderBy: { name: "asc" },
        take: limit,
        skip: limit * (page - 1),
    });
    return {
        categories,
        pagination: {
            page,
            limit,
            totalItems: countCategories,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        },
    };
};
exports.getCategoriesService = getCategoriesService;
