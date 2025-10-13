"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const zod_validation_middleware_1 = require("../middlewares/zod-validation.middleware");
const rate_limit_middleware_1 = require("../middlewares/rate-limit.middleware");
const validation_schemas_1 = require("../utils/validation-schemas");
class AuthRouter {
    constructor() {
        this.authController = new auth_controller_1.AuthController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Register - validate body dengan registerSchema + rate limiting
        this.router.post("/register", rate_limit_middleware_1.authRateLimit, (0, zod_validation_middleware_1.validateBody)(validation_schemas_1.registerSchema), this.authController.registerController);
        // Login - validate body dengan loginSchema + strict rate limiting
        this.router.post("/login", rate_limit_middleware_1.authRateLimit, (0, zod_validation_middleware_1.validateBody)(validation_schemas_1.loginSchema), this.authController.loginController);
        // Verify Email - validate query dengan token
        this.router.get("/verify", this.authController.verifyEmailController);
        // Forgot Password - validate body dengan forgotPasswordSchema + email rate limiting
        this.router.post("/forgot-password", rate_limit_middleware_1.emailRateLimit, (0, zod_validation_middleware_1.validateBody)(validation_schemas_1.forgotPasswordSchema), this.authController.forgotPasswordController);
        // Reset Password - validate body dengan resetPasswordSchema + email rate limiting
        this.router.post("/reset-password", rate_limit_middleware_1.emailRateLimit, (0, zod_validation_middleware_1.validateBody)(validation_schemas_1.resetPasswordSchema), this.authController.resetPasswordController);
        // Google Token - validate body dengan googleTokenSchema + auth rate limiting
        this.router.post("/google-token", rate_limit_middleware_1.authRateLimit, (0, zod_validation_middleware_1.validateBody)(validation_schemas_1.googleTokenSchema), this.authController.googleTokenController);
        // Get Session - dengan authentication middleware
        this.router.get("/session", auth_middleware_1.authenticateToken, this.authController.getSessionController);
        // Verify Email Change - validate query dengan token
        this.router.get("/verify-email-change", this.authController.verifyEmailChangeController);
    }
    getRouter() {
        return this.router;
    }
}
exports.AuthRouter = AuthRouter;
