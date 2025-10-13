"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressRouter = void 0;
const express_1 = require("express");
const address_controller_1 = require("../controllers/address.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const zod_validation_middleware_1 = require("../middlewares/zod-validation.middleware");
const validation_schemas_1 = require("../utils/validation-schemas");
class AddressRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.addressController = new address_controller_1.AddressController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Get user addresses with pagination
        this.router.get("/", auth_middleware_1.requireAuth, (0, zod_validation_middleware_1.validateQuery)(validation_schemas_1.paginationSchema), this.addressController.getUserAddressesController);
        // Create new address
        this.router.post("/", auth_middleware_1.requireAuth, (0, zod_validation_middleware_1.validateBody)(validation_schemas_1.createAddressSchema), this.addressController.createAddressController);
    }
    getRouter() {
        return this.router;
    }
}
exports.AddressRouter = AddressRouter;
