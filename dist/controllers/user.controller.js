"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const get_user_service_1 = require("../services/user/get-user.service");
const get_userId_service_1 = require("../services/user/get-userId.service");
const create_user_service_1 = require("../services/user/create-user.service");
const edit_user_service_1 = require("../services/user/edit-user.service");
const profile_service_1 = require("../services/user/profile.service");
const delete_user_service_1 = require("../services/user/delete-user.service");
const async_handler_middleware_1 = require("../middlewares/async-handler.middleware");
class UserController {
    async getUserController(req, res) {
        try {
            // Use validated query data if available, otherwise fallback to req.query
            const queryData = req.validatedQuery || req.query;
            const result = await (0, get_user_service_1.getUserService)(queryData);
            (0, async_handler_middleware_1.successResponse)(res, result, "Users retrieved successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 500);
        }
    }
    async getUserIdController(req, res) {
        try {
            // Use validated params data if available, otherwise fallback to req.params
            const paramsData = req.validatedParams || req.params;
            const result = await (0, get_userId_service_1.getUserIdService)(paramsData.id);
            (0, async_handler_middleware_1.successResponse)(res, result, "User retrieved successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 404);
        }
    }
    async createUserController(req, res) {
        try {
            const result = await (0, create_user_service_1.createUserService)(req.body);
            (0, async_handler_middleware_1.successResponse)(res, result, "User created successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    async editUserController(req, res) {
        try {
            // Use validated params data if available, otherwise fallback to req.params
            const paramsData = req.validatedParams || req.params;
            const result = await (0, edit_user_service_1.editUserService)(paramsData.id, req.body);
            (0, async_handler_middleware_1.successResponse)(res, result, "User updated successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 404);
        }
    }
    async deleteUserController(req, res) {
        try {
            // Use validated params data if available, otherwise fallback to req.params
            const paramsData = req.validatedParams || req.params;
            const { type } = req.query;
            const { id } = paramsData;
            let result;
            if (type === "hard") {
                result = await (0, delete_user_service_1.hardDeleteUserService)(id);
            }
            else {
                result = await (0, delete_user_service_1.softDeleteUserService)(id);
            }
            (0, async_handler_middleware_1.successResponse)(res, result, "User deleted successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 404);
        }
    }
    async restoreUserController(req, res) {
        try {
            // Use validated params data if available, otherwise fallback to req.params
            const paramsData = req.validatedParams || req.params;
            const result = await (0, delete_user_service_1.restoreUserService)(paramsData.id);
            (0, async_handler_middleware_1.successResponse)(res, result, "User restored successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    // Profile Methods (Self-service)
    async getProfileController(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return (0, async_handler_middleware_1.errorResponse)(res, "User not authenticated", 401);
            }
            const result = await profile_service_1.ProfileService.getUserProfile(userId);
            (0, async_handler_middleware_1.successResponse)(res, result, "Profile retrieved successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    async updateProfileController(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return (0, async_handler_middleware_1.errorResponse)(res, "User not authenticated", 401);
            }
            const result = await profile_service_1.ProfileService.updateProfile(userId, req.body);
            (0, async_handler_middleware_1.successResponse)(res, result, "Profile updated successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    async changePasswordController(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return (0, async_handler_middleware_1.errorResponse)(res, "User not authenticated", 401);
            }
            const result = await profile_service_1.ProfileService.changePassword(userId, req.body);
            (0, async_handler_middleware_1.successResponse)(res, result, "Password changed successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    async updateAvatarController(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return (0, async_handler_middleware_1.errorResponse)(res, "User not authenticated", 401);
            }
            const { avatarUrl } = req.body;
            if (!avatarUrl) {
                return (0, async_handler_middleware_1.errorResponse)(res, "Avatar URL is required", 400);
            }
            const result = await profile_service_1.ProfileService.updateAvatar(userId, avatarUrl);
            (0, async_handler_middleware_1.successResponse)(res, result, "Avatar updated successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
}
exports.UserController = UserController;
