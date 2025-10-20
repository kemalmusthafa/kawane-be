"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const create_admin_service_1 = require("../services/admin/create-admin.service");
const create_staff_service_1 = require("../services/admin/create-staff.service");
const async_handler_middleware_1 = require("../middlewares/async-handler.middleware");
class AdminController {
    async createAdminController(req, res) {
        try {
            const result = await (0, create_admin_service_1.createAdminService)(req.body);
            (0, async_handler_middleware_1.successResponse)(res, result, "Admin created successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    async createStaffController(req, res) {
        try {
            const result = await (0, create_staff_service_1.createStaffService)(req.body);
            (0, async_handler_middleware_1.successResponse)(res, result, "Staff created successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
}
exports.AdminController = AdminController;
