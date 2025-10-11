import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { registerService } from "../services/auth/register.service";
import { loginService } from "../services/auth/login.service";
import { verifyEmailService } from "../services/auth/verif-email.service";
import { verifyEmailChangeService } from "../services/auth/verify-email-change.service";
import { forgotPasswordService } from "../services/auth/forgot-password.service";
import { resetPasswordService } from "../services/auth/reset-password.service";
import { googleTokenService } from "../services/auth/google-token.service";
import { getSessionService } from "../services/auth/get-session.service";
import {
  successResponse,
  errorResponse,
} from "../middlewares/async-handler.middleware";

export class AuthController {
  async registerController(req: Request, res: Response) {
    try {
      console.log("Register request body:", req.body);
      const result = await registerService(req.body);
      console.log("Register result:", result);
      successResponse(res, result, "User registered successfully");
    } catch (error: any) {
      console.error("Register error:", error);
      errorResponse(res, error.message, 400);
    }
  }

  async loginController(req: Request, res: Response) {
    try {
      const result = await loginService(req.body);
      successResponse(res, result, "Login successful");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async verifyEmailController(req: Request, res: Response) {
    try {
      const { token } = req.query;
      const result = await verifyEmailService(token as string);
      successResponse(res, result, "Email verified successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async forgotPasswordController(req: Request, res: Response) {
    try {
      const result = await forgotPasswordService(req.body);
      successResponse(res, result, "Password reset email sent");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async resetPasswordController(req: Request, res: Response) {
    try {
      const result = await resetPasswordService(req.body);
      successResponse(res, result, "Password reset successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async googleTokenController(req: Request, res: Response) {
    try {
      const result = await googleTokenService(req.body);
      successResponse(res, result, "Google login successful");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async getSessionController(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return errorResponse(res, "User not authenticated", 401);
      }
      const result = await getSessionService({ userId });
      successResponse(res, result, "Session retrieved successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async verifyEmailChangeController(req: Request, res: Response) {
    try {
      const { token } = req.query;
      const result = await verifyEmailChangeService(token as string);
      successResponse(res, result, "Email change verified successfully");
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }
}
