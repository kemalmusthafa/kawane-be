import { Request, Response } from "express";
import { getUserService } from "../services/user/get-user.service";
import { getUserIdService } from "../services/user/get-userId.service";
import { createUserService } from "../services/user/create-user.service";
import { editUserService } from "../services/user/edit-user.service";
import { ProfileService } from "../services/user/profile.service";
import {
  hardDeleteUserService,
  restoreUserService,
  softDeleteUserService,
} from "../services/user/delete-user.service";
import {
  successResponse,
  errorResponse,
} from "../middlewares/async-handler.middleware";

// AuthRequest interface untuk profile methods
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export class UserController {
  async getUserController(req: Request, res: Response) {
    try {
      // Use validated query data if available, otherwise fallback to req.query
      const queryData = (req as any).validatedQuery || req.query;
      const result = await getUserService(queryData);
      successResponse(res, result, "Users retrieved successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 500);
    }
  }

  async getUserIdController(req: Request, res: Response) {
    try {
      // Use validated params data if available, otherwise fallback to req.params
      const paramsData = (req as any).validatedParams || req.params;
      const result = await getUserIdService(paramsData.id);
      successResponse(res, result, "User retrieved successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 404);
    }
  }

  async createUserController(req: Request, res: Response) {
    try {
      const result = await createUserService(req.body);
      successResponse(res, result, "User created successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async editUserController(req: Request, res: Response) {
    try {
      // Use validated params data if available, otherwise fallback to req.params
      const paramsData = (req as any).validatedParams || req.params;
      const result = await editUserService(paramsData.id, req.body);
      successResponse(res, result, "User updated successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 404);
    }
  }

  async deleteUserController(req: Request, res: Response) {
    try {
      // Use validated params data if available, otherwise fallback to req.params
      const paramsData = (req as any).validatedParams || req.params;
      const { type } = req.query;
      const { id } = paramsData;

      let result;

      if (type === "hard") {
        result = await hardDeleteUserService(id);
      } else {
        result = await softDeleteUserService(id);
      }

      successResponse(res, result, "User deleted successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 404);
    }
  }

  async restoreUserController(req: Request, res: Response) {
    try {
      // Use validated params data if available, otherwise fallback to req.params
      const paramsData = (req as any).validatedParams || req.params;
      const result = await restoreUserService(paramsData.id);
      successResponse(res, result, "User restored successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  // Profile Methods (Self-service)
  async getProfileController(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return errorResponse(res, "User not authenticated", 401);
      }

      const result = await ProfileService.getUserProfile(userId);
      successResponse(res, result, "Profile retrieved successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async updateProfileController(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return errorResponse(res, "User not authenticated", 401);
      }

      const result = await ProfileService.updateProfile(userId, req.body);
      successResponse(res, result, "Profile updated successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async changePasswordController(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return errorResponse(res, "User not authenticated", 401);
      }

      const result = await ProfileService.changePassword(userId, req.body);
      successResponse(res, result, "Password changed successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async updateAvatarController(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return errorResponse(res, "User not authenticated", 401);
      }

      const { avatarUrl } = req.body;
      if (!avatarUrl) {
        return errorResponse(res, "Avatar URL is required", 400);
      }

      const result = await ProfileService.updateAvatar(userId, avatarUrl);
      successResponse(res, result, "Avatar updated successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }
}
