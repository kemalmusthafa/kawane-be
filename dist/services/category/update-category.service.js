"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategoryService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const updateCategoryService = async (categoryId, data) => {
    const existingCategory = await prisma_1.default.category.findUnique({
        where: { id: categoryId },
    });
    if (!existingCategory) {
        throw new Error("Category not found");
    }
    // Validasi duplicate name dihapus - sekarang bisa update category dengan nama yang sama
    const category = await prisma_1.default.category.update({
        where: { id: categoryId },
        data: {
            ...(data.name && { name: data.name.trim() }),
            ...(data.description !== undefined && {
                description: data.description?.trim(),
            }),
            ...(data.image !== undefined && { image: data.image }),
        },
        include: {
            _count: {
                select: {
                    products: true,
                },
            },
        },
    });
    return category;
};
exports.updateCategoryService = updateCategoryService;
