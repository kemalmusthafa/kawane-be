import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { requireAuth, requireAdmin } from "../middlewares/auth.middleware";
import {
  validateBody,
  validateQuery,
  validateParams,
} from "../middlewares/zod-validation.middleware";
import {
  createUserSchema,
  updateUserSchema,
  userQuerySchema,
  idParamSchema,
} from "../utils/validation-schemas";
import { z } from "zod";

// Profile validation schemas
const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email format").optional(),
  phone: z.string().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

const updateAvatarSchema = z.object({
  avatarUrl: z.string().url("Invalid avatar URL"),
});

export class UserRouter {
  private userController: UserController;
  private router: Router;

  constructor() {
    this.userController = new UserController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // PROFILE ENDPOINTS (Self-service) - Must be before /:id routes
    // Get own profile
    this.router.get(
      "/profile",
      requireAuth,
      this.userController.getProfileController
    );

    // Update own profile
    this.router.put(
      "/profile",
      requireAuth,
      validateBody(updateProfileSchema),
      this.userController.updateProfileController
    );

    // Change own password
    this.router.put(
      "/profile/password",
      requireAuth,
      validateBody(changePasswordSchema),
      this.userController.changePasswordController
    );

    // Update own avatar
    this.router.put(
      "/profile/avatar",
      requireAuth,
      validateBody(updateAvatarSchema),
      this.userController.updateAvatarController
    );

    // ADMIN ENDPOINTS (Admin only)
    // Get all users with pagination (Admin only)
    this.router.get(
      "/",
      requireAuth,
      requireAdmin,
      validateQuery(userQuerySchema),
      this.userController.getUserController
    );

    // Create new user (Admin only)
    this.router.post(
      "/",
      requireAuth,
      requireAdmin,
      validateBody(createUserSchema),
      this.userController.createUserController
    );

    // Get user by ID (Admin only) - Must be after /profile routes
    this.router.get(
      "/:id",
      requireAuth,
      requireAdmin,
      validateParams(idParamSchema),
      this.userController.getUserIdController
    );

    // Update user (Admin only)
    this.router.put(
      "/:id",
      requireAuth,
      requireAdmin,
      validateParams(idParamSchema),
      validateBody(updateUserSchema),
      this.userController.editUserController
    );

    // Delete user (Admin only)
    this.router.delete(
      "/:id",
      requireAuth,
      requireAdmin,
      validateParams(idParamSchema),
      this.userController.deleteUserController
    );

    // Restore soft-deleted user (Admin only)
    this.router.patch(
      "/:id/restore",
      requireAuth,
      requireAdmin,
      validateParams(idParamSchema),
      this.userController.restoreUserController
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
