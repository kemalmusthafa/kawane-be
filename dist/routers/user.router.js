"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRouter = void 0;
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const zod_validation_middleware_1 = require("../middlewares/zod-validation.middleware");
const validation_schemas_1 = require("../utils/validation-schemas");
const zod_1 = require("zod");
// Profile validation schemas
const updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required").optional(),
    email: zod_1.z.string().email("Invalid email format").optional(),
    phone: zod_1.z.string().optional(),
});
const changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, "Current password is required"),
    newPassword: zod_1.z.string().min(6, "New password must be at least 6 characters"),
});
const updateAvatarSchema = zod_1.z.object({
    avatarUrl: zod_1.z.string().url("Invalid avatar URL"),
});
class UserRouter {
    constructor() {
        this.userController = new user_controller_1.UserController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // PROFILE ENDPOINTS (Self-service) - Must be before /:id routes
        // Get own profile
        this.router.get("/profile", auth_middleware_1.requireAuth, this.userController.getProfileController);
        // Update own profile
        this.router.put("/profile", auth_middleware_1.requireAuth, (0, zod_validation_middleware_1.validateBody)(updateProfileSchema), this.userController.updateProfileController);
        // Change own password
        this.router.put("/profile/password", auth_middleware_1.requireAuth, (0, zod_validation_middleware_1.validateBody)(changePasswordSchema), this.userController.changePasswordController);
        // Update own avatar
        this.router.put("/profile/avatar", auth_middleware_1.requireAuth, (0, zod_validation_middleware_1.validateBody)(updateAvatarSchema), this.userController.updateAvatarController);
        // ADMIN ENDPOINTS (Admin only)
        // Get all users with pagination (Admin only)
        this.router.get("/", auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, (0, zod_validation_middleware_1.validateQuery)(validation_schemas_1.userQuerySchema), this.userController.getUserController);
        // Create new user (Admin only)
        this.router.post("/", auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, (0, zod_validation_middleware_1.validateBody)(validation_schemas_1.createUserSchema), this.userController.createUserController);
        // Get user by ID (Admin only) - Must be after /profile routes
        this.router.get("/:id", auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, (0, zod_validation_middleware_1.validateParams)(validation_schemas_1.idParamSchema), this.userController.getUserIdController);
        // Update user (Admin only)
        this.router.put("/:id", auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, (0, zod_validation_middleware_1.validateParams)(validation_schemas_1.idParamSchema), (0, zod_validation_middleware_1.validateBody)(validation_schemas_1.updateUserSchema), this.userController.editUserController);
        // Delete user (Admin only)
        this.router.delete("/:id", auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, (0, zod_validation_middleware_1.validateParams)(validation_schemas_1.idParamSchema), this.userController.deleteUserController);
        // Restore soft-deleted user (Admin only)
        this.router.patch("/:id/restore", auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, (0, zod_validation_middleware_1.validateParams)(validation_schemas_1.idParamSchema), this.userController.restoreUserController);
    }
    getRouter() {
        return this.router;
    }
}
exports.UserRouter = UserRouter;
