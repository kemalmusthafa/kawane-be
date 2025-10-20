"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const upload_category_image_cloudinary_service_1 = require("../services/category/upload-category-image-cloudinary.service");
const async_handler_middleware_1 = require("../middlewares/async-handler.middleware");
class CategoryController {
    // Upload gambar kategori (Cloudinary)
    async uploadCategoryImageCloudinaryController(req, res) {
        try {
            // Cek apakah user adalah admin
            if (!req.user || req.user.role !== "ADMIN") {
                return (0, async_handler_middleware_1.errorResponse)(res, "Unauthorized. Admin access required", 403);
            }
            // Cek apakah ada file yang diupload
            if (!req.file) {
                return (0, async_handler_middleware_1.errorResponse)(res, "No image file provided", 400);
            }
            // Upload gambar ke Cloudinary
            const result = await (0, upload_category_image_cloudinary_service_1.uploadCategoryImageCloudinaryService)(req.file);
            (0, async_handler_middleware_1.successResponse)(res, result.data, result.message);
        }
        catch (error) {
            console.error("Upload category image to Cloudinary error:", error);
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
    // Update gambar kategori
    async updateCategoryImageController(req, res) {
        try {
            const { categoryId } = req.params;
            // Cek apakah user adalah admin
            if (!req.user || req.user.role !== "ADMIN") {
                return (0, async_handler_middleware_1.errorResponse)(res, "Unauthorized. Admin access required", 403);
            }
            // Cek apakah kategori ada
            const category = await prisma_1.default.category.findUnique({
                where: { id: categoryId },
            });
            if (!category) {
                return (0, async_handler_middleware_1.errorResponse)(res, "Category not found", 404);
            }
            // Cek apakah ada file yang diupload
            if (!req.file) {
                return (0, async_handler_middleware_1.errorResponse)(res, "No image file provided", 400);
            }
            // Upload gambar baru ke Cloudinary
            const uploadResult = await (0, upload_category_image_cloudinary_service_1.uploadCategoryImageCloudinaryService)(req.file);
            // Update kategori dengan gambar baru
            const updatedCategory = await prisma_1.default.category.update({
                where: { id: categoryId },
                data: {
                    image: uploadResult.data.url,
                },
                include: {
                    products: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
            (0, async_handler_middleware_1.successResponse)(res, {
                category: updatedCategory,
                image: uploadResult.data,
            }, "Category image updated successfully");
        }
        catch (error) {
            console.error("Update category image error:", error);
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
    // Get semua kategori
    async getCategoriesController(req, res) {
        try {
            const categories = await prisma_1.default.category.findMany({
                include: {
                    products: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    _count: {
                        select: {
                            products: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
            (0, async_handler_middleware_1.successResponse)(res, categories, "Categories retrieved successfully");
        }
        catch (error) {
            console.error("Get categories error:", error);
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
    // Get kategori by ID
    async getCategoryByIdController(req, res) {
        try {
            const { categoryId } = req.params;
            const category = await prisma_1.default.category.findUnique({
                where: { id: categoryId },
                include: {
                    products: {
                        include: {
                            images: true,
                        },
                    },
                    _count: {
                        select: {
                            products: true,
                        },
                    },
                },
            });
            if (!category) {
                return (0, async_handler_middleware_1.errorResponse)(res, "Category not found", 404);
            }
            (0, async_handler_middleware_1.successResponse)(res, category, "Category retrieved successfully");
        }
        catch (error) {
            console.error("Get category by ID error:", error);
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
    // Create kategori baru
    async createCategoryController(req, res) {
        try {
            const { name, description, image } = req.body;
            // Cek apakah user adalah admin
            if (!req.user || req.user.role !== "ADMIN") {
                return (0, async_handler_middleware_1.errorResponse)(res, "Unauthorized. Admin access required", 403);
            }
            // Validasi input
            if (!name) {
                return (0, async_handler_middleware_1.errorResponse)(res, "Category name is required", 400);
            }
            // Validasi duplicate name dihapus - sekarang bisa membuat category dengan nama yang sama
            // Buat kategori baru
            const newCategory = await prisma_1.default.category.create({
                data: {
                    name: name.trim(),
                    description: description?.trim(),
                    image,
                },
                include: {
                    _count: {
                        select: {
                            products: true,
                        },
                    },
                },
            });
            (0, async_handler_middleware_1.successResponse)(res, newCategory, "Category created successfully");
        }
        catch (error) {
            console.error("Create category error:", error);
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
    // Update kategori
    async updateCategoryController(req, res) {
        try {
            const { categoryId } = req.params;
            const { name, description, image } = req.body;
            // Cek apakah user adalah admin
            if (!req.user || req.user.role !== "ADMIN") {
                return (0, async_handler_middleware_1.errorResponse)(res, "Unauthorized. Admin access required", 403);
            }
            // Cek apakah kategori ada
            const existingCategory = await prisma_1.default.category.findUnique({
                where: { id: categoryId },
            });
            if (!existingCategory) {
                return (0, async_handler_middleware_1.errorResponse)(res, "Category not found", 404);
            }
            // Cek duplikasi nama jika nama diubah
            if (name && name.trim() !== existingCategory.name) {
                const duplicateCategory = await prisma_1.default.category.findFirst({
                    where: {
                        name: {
                            equals: name.trim(),
                            mode: "insensitive",
                        },
                        id: {
                            not: categoryId,
                        },
                    },
                });
                if (duplicateCategory) {
                    return (0, async_handler_middleware_1.errorResponse)(res, "Category with this name already exists", 400);
                }
            }
            // Update kategori
            const updatedCategory = await prisma_1.default.category.update({
                where: { id: categoryId },
                data: {
                    name: name || existingCategory.name,
                    description: description !== undefined
                        ? description
                        : existingCategory.description,
                    image: image !== undefined ? image : existingCategory.image,
                },
                include: {
                    products: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    _count: {
                        select: {
                            products: true,
                        },
                    },
                },
            });
            (0, async_handler_middleware_1.successResponse)(res, updatedCategory, "Category updated successfully");
        }
        catch (error) {
            console.error("Update category error:", error);
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
    // Delete kategori
    async deleteCategoryController(req, res) {
        try {
            const { categoryId } = req.params;
            // Cek apakah user adalah admin
            if (!req.user || req.user.role !== "ADMIN") {
                return (0, async_handler_middleware_1.errorResponse)(res, "Unauthorized. Admin access required", 403);
            }
            // Cek apakah kategori ada
            const existingCategory = await prisma_1.default.category.findUnique({
                where: { id: categoryId },
                include: {
                    products: true,
                },
            });
            if (!existingCategory) {
                return (0, async_handler_middleware_1.errorResponse)(res, "Category not found", 404);
            }
            // Cek apakah kategori memiliki produk
            if (existingCategory.products.length > 0) {
                return (0, async_handler_middleware_1.errorResponse)(res, "Cannot delete category with existing products", 400);
            }
            // Delete kategori
            await prisma_1.default.category.delete({
                where: { id: categoryId },
            });
            (0, async_handler_middleware_1.successResponse)(res, null, "Category deleted successfully");
        }
        catch (error) {
            console.error("Delete category error:", error);
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
}
exports.CategoryController = CategoryController;
