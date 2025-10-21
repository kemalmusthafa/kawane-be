"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const upload_category_image_cloudinary_service_1 = require("../services/category/upload-category-image-cloudinary.service");
const create_category_service_1 = require("../services/category/create-category.service");
const update_category_service_1 = require("../services/category/update-category.service");
const delete_category_service_1 = require("../services/category/delete-category.service");
const get_categories_service_1 = require("../services/category/get-categories.service");
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
            const { page, limit, includeProducts } = req.query;
            const result = await (0, get_categories_service_1.getCategoriesService)({
                page: page ? parseInt(page) : undefined,
                limit: limit ? parseInt(limit) : undefined,
                includeProducts: includeProducts === "true",
            });
            (0, async_handler_middleware_1.successResponse)(res, result, "Categories retrieved successfully");
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
            // Buat kategori baru menggunakan service
            const newCategory = await (0, create_category_service_1.createCategoryService)({
                name,
                description,
                image,
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
            // Update kategori menggunakan service
            const updatedCategory = await (0, update_category_service_1.updateCategoryService)(categoryId, {
                name,
                description,
                image,
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
            // Delete kategori menggunakan service
            const result = await (0, delete_category_service_1.deleteCategoryService)(categoryId);
            (0, async_handler_middleware_1.successResponse)(res, result, result.message);
        }
        catch (error) {
            console.error("Delete category error:", error);
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
}
exports.CategoryController = CategoryController;
