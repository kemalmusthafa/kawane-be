"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategoryService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const deleteCategoryService = async (categoryId) => {
    const existingCategory = await prisma_1.default.category.findUnique({
        where: { id: categoryId },
        include: {
            _count: {
                select: {
                    products: true,
                },
            },
        },
    });
    if (!existingCategory) {
        throw new Error("Category not found");
    }
    // Check if category has products
    if (existingCategory._count.products > 0) {
        throw new Error("Cannot delete category that has products. Please move or delete the products first.");
    }
    await prisma_1.default.category.delete({
        where: { id: categoryId },
    });
    return { message: "Category deleted successfully" };
};
exports.deleteCategoryService = deleteCategoryService;
