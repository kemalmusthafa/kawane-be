"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategoryService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const createCategoryService = async (data) => {
    if (!data.name.trim()) {
        throw new Error("Category name is required");
    }
    // Validasi duplicate name dihapus - sekarang bisa membuat category dengan nama yang sama
    const category = await prisma_1.default.category.create({
        data: {
            name: data.name.trim(),
            description: data.description?.trim(),
            image: data.image,
        },
    });
    return category;
};
exports.createCategoryService = createCategoryService;
