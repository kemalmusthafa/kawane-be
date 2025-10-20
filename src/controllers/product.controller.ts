import { Request, Response } from "express";
import { createProductService } from "../services/product/create-product.service";
import {
  getProductsService,
  GetProductsParams,
} from "../services/product/get-products.service";
import { getProductDetailService } from "../services/product/get-product-detail.service";
import { updateProductService } from "../services/product/update-product.service";
import { deleteProductService } from "../services/product/delete-product.service";
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

export class ProductController {
  async createProductController(req: AuthRequest, res: Response) {
    try {
      const product = await createProductService(req.body);
      successResponse(res, product, "Product created successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async getProductsController(req: AuthRequest, res: Response) {
    try {
      // Use validated query data if available, otherwise fallback to req.query
      const queryData = (req as any).validatedQuery || req.query;
      console.log("Controller received queryData:", queryData);

      const {
        search,
        categoryId,
        status,
        inStock,
        minPrice,
        maxPrice,
        page,
        limit,
        sortBy,
        sortOrder,
      } = queryData;

      // Check if user is admin to include deal-specific products
      const isAdmin = req.user?.role === "ADMIN";
      const includeDealSpecific = isAdmin;

      console.log("Parsed parameters:", {
        search,
        categoryId,
        status,
        inStock,
        minPrice,
        maxPrice,
        page,
        limit,
        sortBy,
        sortOrder,
        includeDealSpecific,
        userRole: req.user?.role,
      });

      const result = await getProductsService({
        search: search as string,
        categoryId: categoryId as string,
        status: status as string,
        inStock: inStock as boolean,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        sortBy: sortBy as "name" | "price" | "createdAt",
        sortOrder: sortOrder as "asc" | "desc",
        includeDealSpecific,
      });

      successResponse(res, result, "Products retrieved successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async getProductDetailController(req: AuthRequest, res: Response) {
    try {
      // Use validated params data if available, otherwise fallback to req.params
      const paramsData = (req as any).validatedParams || req.params;
      const { productId } = paramsData;
      const userId = req.user?.id;

      // Check if user is admin to include deal-specific products
      const isAdmin = req.user?.role === "ADMIN";
      const includeDealSpecific = isAdmin;

      const product = await getProductDetailService({
        productId,
        userId,
        includeDealSpecific,
      });
      successResponse(res, product, "Product detail retrieved successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async updateProductController(req: AuthRequest, res: Response) {
    try {
      // Use validated params data if available, otherwise fallback to req.params
      const paramsData = (req as any).validatedParams || req.params;
      const { productId } = paramsData;

      const product = await updateProductService({
        id: productId,
        ...req.body,
      });

      successResponse(res, product, "Product updated successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async deleteProductController(req: AuthRequest, res: Response) {
    try {
      // Use validated params data if available, otherwise fallback to req.params
      const paramsData = (req as any).validatedParams || req.params;
      const { productId } = paramsData;

      const result = await deleteProductService({
        id: productId,
      });

      successResponse(res, result, "Product deleted successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }
}
