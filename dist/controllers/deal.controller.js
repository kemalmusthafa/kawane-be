"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DealController = void 0;
const create_deal_service_1 = require("../services/deal/create-deal.service");
const get_deals_service_1 = require("../services/deal/get-deals.service");
const get_deal_by_id_service_1 = require("../services/deal/get-deal-by-id.service");
const update_deal_service_1 = require("../services/deal/update-deal.service");
const delete_deal_service_1 = require("../services/deal/delete-deal.service");
const upload_deal_image_cloudinary_service_1 = require("../services/deal/upload-deal-image-cloudinary.service");
const async_handler_middleware_1 = require("../middlewares/async-handler.middleware");
class DealController {
    // Create new deal (Admin/Staff only)
    async createDealController(req, res) {
        try {
            const dealData = req.validatedBody || req.body;
            const result = await (0, create_deal_service_1.createDealService)(dealData);
            (0, async_handler_middleware_1.successResponse)(res, result.data, result.message);
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    // Get all deals
    async getDealsController(req, res) {
        try {
            const queryData = req.validatedQuery || req.query;
            const result = await (0, get_deals_service_1.getDealsService)(queryData);
            (0, async_handler_middleware_1.successResponse)(res, result, "Deals retrieved successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    // Get deal by ID
    async getDealByIdController(req, res) {
        try {
            const paramsData = req.validatedParams || req.params;
            const { id } = paramsData;
            const result = await (0, get_deal_by_id_service_1.getDealByIdService)({ id });
            (0, async_handler_middleware_1.successResponse)(res, result.data, result.message);
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 404);
        }
    }
    // Update deal (Admin/Staff only)
    async updateDealController(req, res) {
        try {
            const paramsData = req.validatedParams || req.params;
            const bodyData = req.validatedBody || req.body;
            const { id } = paramsData;
            const result = await (0, update_deal_service_1.updateDealService)({
                id,
                ...bodyData,
            });
            (0, async_handler_middleware_1.successResponse)(res, result.data, result.message);
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    // Delete deal (Admin/Staff only)
    async deleteDealController(req, res) {
        try {
            const paramsData = req.validatedParams || req.params;
            const { id } = paramsData;
            const result = await (0, delete_deal_service_1.deleteDealService)({ id });
            (0, async_handler_middleware_1.successResponse)(res, null, result.message);
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    // Get active flash sales
    async getFlashSalesController(req, res) {
        try {
            const result = await (0, get_deals_service_1.getDealsService)({
                isFlashSale: true,
                status: "ACTIVE",
                includeExpired: false,
            });
            (0, async_handler_middleware_1.successResponse)(res, result, "Flash sales retrieved successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    // Get featured deals
    async getFeaturedDealsController(req, res) {
        try {
            const result = await (0, get_deals_service_1.getDealsService)({
                status: "ACTIVE",
                isFlashSale: false,
                includeExpired: false,
                limit: 6,
            });
            (0, async_handler_middleware_1.successResponse)(res, result, "Featured deals retrieved successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    // Upload deal image (Admin/Staff only)
    async uploadDealImageController(req, res) {
        try {
            const file = req.file;
            if (!file) {
                return (0, async_handler_middleware_1.errorResponse)(res, "No image file provided", 400);
            }
            const result = await (0, upload_deal_image_cloudinary_service_1.uploadDealImageCloudinaryService)(file);
            (0, async_handler_middleware_1.successResponse)(res, result.data, result.message);
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
}
exports.DealController = DealController;
