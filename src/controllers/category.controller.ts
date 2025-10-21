import { Request, Response } from "express";
import prisma from "../prisma";
import { uploadCategoryImageCloudinaryService } from "../services/category/upload-category-image-cloudinary.service";
import { createCategoryService } from "../services/category/create-category.service";
import { updateCategoryService } from "../services/category/update-category.service";
import { deleteCategoryService } from "../services/category/delete-category.service";
import { getCategoriesService } from "../services/category/get-categories.service";
import {
  successResponse,
  errorResponse,
} from "../middlewares/async-handler.middleware";

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export class CategoryController {
  // Upload gambar kategori (Cloudinary)
  async uploadCategoryImageCloudinaryController(
    req: AuthRequest,
    res: Response
  ) {
    try {
      // Cek apakah user adalah admin
      if (!req.user || req.user.role !== "ADMIN") {
        return errorResponse(res, "Unauthorized. Admin access required", 403);
      }

      // Cek apakah ada file yang diupload
      if (!req.file) {
        return errorResponse(res, "No image file provided", 400);
      }

      // Upload gambar ke Cloudinary
      const result = await uploadCategoryImageCloudinaryService(req.file);

      successResponse(res, result.data, result.message);
    } catch (error: any) {
      console.error("Upload category image to Cloudinary error:", error);
      errorResponse(res, error.message, 500);
    }
  }

  // Update gambar kategori
  async updateCategoryImageController(req: AuthRequest, res: Response) {
    try {
      const { categoryId } = req.params;

      // Cek apakah user adalah admin
      if (!req.user || req.user.role !== "ADMIN") {
        return errorResponse(res, "Unauthorized. Admin access required", 403);
      }

      // Cek apakah kategori ada
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return errorResponse(res, "Category not found", 404);
      }

      // Cek apakah ada file yang diupload
      if (!req.file) {
        return errorResponse(res, "No image file provided", 400);
      }

      // Upload gambar baru ke Cloudinary
      const uploadResult = await uploadCategoryImageCloudinaryService(req.file);

      // Update kategori dengan gambar baru
      const updatedCategory = await prisma.category.update({
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

      successResponse(
        res,
        {
          category: updatedCategory,
          image: uploadResult.data,
        },
        "Category image updated successfully"
      );
    } catch (error: any) {
      console.error("Update category image error:", error);
      errorResponse(res, error.message, 500);
    }
  }

  // Get semua kategori
  async getCategoriesController(req: Request, res: Response) {
    try {
      const { page, limit, includeProducts } = req.query;

      const result = await getCategoriesService({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        includeProducts: includeProducts === "true",
      });

      successResponse(res, result, "Categories retrieved successfully");
    } catch (error: any) {
      console.error("Get categories error:", error);
      errorResponse(res, error.message, 500);
    }
  }

  // Get kategori by ID
  async getCategoryByIdController(req: Request, res: Response) {
    try {
      const { categoryId } = req.params;

      const category = await prisma.category.findUnique({
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
        return errorResponse(res, "Category not found", 404);
      }

      successResponse(res, category, "Category retrieved successfully");
    } catch (error: any) {
      console.error("Get category by ID error:", error);
      errorResponse(res, error.message, 500);
    }
  }

  // Create kategori baru
  async createCategoryController(req: AuthRequest, res: Response) {
    try {
      const { name, description, image } = req.body;

      // Cek apakah user adalah admin
      if (!req.user || req.user.role !== "ADMIN") {
        return errorResponse(res, "Unauthorized. Admin access required", 403);
      }

      // Buat kategori baru menggunakan service
      const newCategory = await createCategoryService({
        name,
        description,
        image,
      });

      successResponse(res, newCategory, "Category created successfully");
    } catch (error: any) {
      console.error("Create category error:", error);
      errorResponse(res, error.message, 500);
    }
  }

  // Update kategori
  async updateCategoryController(req: AuthRequest, res: Response) {
    try {
      const { categoryId } = req.params;
      const { name, description, image } = req.body;

      // Cek apakah user adalah admin
      if (!req.user || req.user.role !== "ADMIN") {
        return errorResponse(res, "Unauthorized. Admin access required", 403);
      }

      // Update kategori menggunakan service
      const updatedCategory = await updateCategoryService(categoryId, {
        name,
        description,
        image,
      });

      successResponse(res, updatedCategory, "Category updated successfully");
    } catch (error: any) {
      console.error("Update category error:", error);
      errorResponse(res, error.message, 500);
    }
  }

  // Delete kategori
  async deleteCategoryController(req: AuthRequest, res: Response) {
    try {
      const { categoryId } = req.params;

      // Cek apakah user adalah admin
      if (!req.user || req.user.role !== "ADMIN") {
        return errorResponse(res, "Unauthorized. Admin access required", 403);
      }

      // Delete kategori menggunakan service
      const result = await deleteCategoryService(categoryId);

      successResponse(res, result, result.message);
    } catch (error: any) {
      console.error("Delete category error:", error);
      errorResponse(res, error.message, 500);
    }
  }
}
