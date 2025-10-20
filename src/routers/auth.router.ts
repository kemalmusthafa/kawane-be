import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
import {
  validateBody,
  validateQuery,
} from "../middlewares/zod-validation.middleware";
import {
  authRateLimit,
  emailRateLimit,
  emailRateLimitHourly,
} from "../middlewares/rate-limit.middleware";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  googleTokenSchema,
} from "../utils/validation-schemas";

export class AuthRouter {
  private authController: AuthController;
  private router: Router;

  constructor() {
    this.authController = new AuthController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Register - validate body dengan registerSchema + rate limiting
    this.router.post(
      "/register",
      authRateLimit,
      validateBody(registerSchema),
      this.authController.registerController
    );

    // Login - validate body dengan loginSchema + strict rate limiting
    this.router.post(
      "/login",
      authRateLimit,
      validateBody(loginSchema),
      this.authController.loginController
    );

    // Verify Email - validate query dengan token
    this.router.get("/verify", this.authController.verifyEmailController);

    // Forgot Password - validate body dengan forgotPasswordSchema + email rate limiting (daily + hourly)
    this.router.post(
      "/forgot-password",
      emailRateLimitHourly, // Apply hourly limit first
      emailRateLimit, // Then apply daily limit
      validateBody(forgotPasswordSchema),
      this.authController.forgotPasswordController
    );

    // Reset Password - validate body dengan resetPasswordSchema + email rate limiting (daily + hourly)
    this.router.post(
      "/reset-password",
      emailRateLimitHourly, // Apply hourly limit first
      emailRateLimit, // Then apply daily limit
      validateBody(resetPasswordSchema),
      this.authController.resetPasswordController
    );

    // Google Token - validate body dengan googleTokenSchema + auth rate limiting
    this.router.post(
      "/google-token",
      authRateLimit,
      validateBody(googleTokenSchema),
      this.authController.googleTokenController
    );

    // Get Session - dengan authentication middleware
    this.router.get(
      "/session",
      authenticateToken,
      this.authController.getSessionController
    );

    // Verify Email Change - validate query dengan token
    this.router.get(
      "/verify-email-change",
      this.authController.verifyEmailChangeController
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
