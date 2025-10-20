"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressController = void 0;
const create_address_service_1 = require("../services/address/create-address.service");
const get_user_addresses_service_1 = require("../services/address/get-user-addresses.service");
const update_address_service_1 = require("../services/address/update-address.service");
const delete_address_service_1 = require("../services/address/delete-address.service");
const async_handler_middleware_1 = require("../middlewares/async-handler.middleware");
class AddressController {
    async createAddressController(req, res) {
        try {
            const userId = req.user.id;
            const address = await (0, create_address_service_1.createAddressService)({
                userId,
                ...req.body,
            });
            (0, async_handler_middleware_1.successResponse)(res, address, "Address created successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    async getUserAddressesController(req, res) {
        try {
            const userId = req.user.id;
            // Use validated query data if available, otherwise fallback to req.query
            const queryData = req.validatedQuery || req.query;
            const { page, limit } = queryData;
            const result = await (0, get_user_addresses_service_1.getUserAddressesService)({
                userId,
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 10,
            });
            (0, async_handler_middleware_1.successResponse)(res, result, "Addresses retrieved successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    async updateAddressController(req, res) {
        try {
            const userId = req.user.id;
            const addressId = req.params.id;
            const address = await (0, update_address_service_1.updateAddressService)({
                addressId,
                userId,
                ...req.body,
            });
            (0, async_handler_middleware_1.successResponse)(res, address, "Address updated successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    async deleteAddressController(req, res) {
        try {
            const userId = req.user.id;
            const addressId = req.params.id;
            await (0, delete_address_service_1.deleteAddressService)({
                addressId,
                userId,
            });
            (0, async_handler_middleware_1.successResponse)(res, null, "Address deleted successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
}
exports.AddressController = AddressController;
