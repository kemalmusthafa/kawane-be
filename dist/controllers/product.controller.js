"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const create_product_service_1 = require("../services/product/create-product.service");
const get_products_service_1 = require("../services/product/get-products.service");
const get_product_detail_service_1 = require("../services/product/get-product-detail.service");
const update_product_service_1 = require("../services/product/update-product.service");
const delete_product_service_1 = require("../services/product/delete-product.service");
const async_handler_middleware_1 = require("../middlewares/async-handler.middleware");
class ProductController {
    async createProductController(req, res) {
        try {
            const product = await (0, create_product_service_1.createProductService)(req.body);
            (0, async_handler_middleware_1.successResponse)(res, product, "Product created successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    async getProductsController(req, res) {
        try {
            // Use validated query data if available, otherwise fallback to req.query
            const queryData = req.validatedQuery || req.query;
            console.log("Controller received queryData:", queryData);
            const { search, categoryId, status, inStock, minPrice, maxPrice, page, limit, sortBy, sortOrder, } = queryData;
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
            const result = await (0, get_products_service_1.getProductsService)({
                search: search,
                categoryId: categoryId,
                status: status,
                inStock: inStock,
                minPrice: minPrice ? parseFloat(minPrice) : undefined,
                maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 10,
                sortBy: sortBy,
                sortOrder: sortOrder,
                includeDealSpecific,
            });
            (0, async_handler_middleware_1.successResponse)(res, result, "Products retrieved successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    async getProductDetailController(req, res) {
        try {
            // Use validated params data if available, otherwise fallback to req.params
            const paramsData = req.validatedParams || req.params;
            const { productId } = paramsData;
            const userId = req.user?.id;
            // Check if user is admin to include deal-specific products
            const isAdmin = req.user?.role === "ADMIN";
            const includeDealSpecific = isAdmin;
            const product = await (0, get_product_detail_service_1.getProductDetailService)({
                productId,
                userId,
                includeDealSpecific,
            });
            (0, async_handler_middleware_1.successResponse)(res, product, "Product detail retrieved successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    async updateProductController(req, res) {
        try {
            // Use validated params data if available, otherwise fallback to req.params
            const paramsData = req.validatedParams || req.params;
            const { productId } = paramsData;
            const product = await (0, update_product_service_1.updateProductService)({
                id: productId,
                ...req.body,
            });
            (0, async_handler_middleware_1.successResponse)(res, product, "Product updated successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    async deleteProductController(req, res) {
        try {
            // Use validated params data if available, otherwise fallback to req.params
            const paramsData = req.validatedParams || req.params;
            const { productId } = paramsData;
            const result = await (0, delete_product_service_1.deleteProductService)({
                id: productId,
            });
            (0, async_handler_middleware_1.successResponse)(res, result, "Product deleted successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
}
exports.ProductController = ProductController;
