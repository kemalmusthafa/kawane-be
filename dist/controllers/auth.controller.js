"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const register_service_1 = require("../services/auth/register.service");
const login_service_1 = require("../services/auth/login.service");
const verif_email_service_1 = require("../services/auth/verif-email.service");
const verify_email_change_service_1 = require("../services/auth/verify-email-change.service");
const forgot_password_service_1 = require("../services/auth/forgot-password.service");
const reset_password_service_1 = require("../services/auth/reset-password.service");
const google_token_service_1 = require("../services/auth/google-token.service");
const get_session_service_1 = require("../services/auth/get-session.service");
const async_handler_middleware_1 = require("../middlewares/async-handler.middleware");
class AuthController {
    async registerController(req, res) {
        try {
            console.log("Register request body:", req.body);
            const result = await (0, register_service_1.registerService)(req.body);
            console.log("Register result:", result);
            (0, async_handler_middleware_1.successResponse)(res, result, "User registered successfully");
        }
        catch (error) {
            console.error("Register error:", error);
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    async loginController(req, res) {
        try {
            const result = await (0, login_service_1.loginService)(req.body);
            (0, async_handler_middleware_1.successResponse)(res, result, "Login successful");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    async verifyEmailController(req, res) {
        try {
            const { token } = req.query;
            const result = await (0, verif_email_service_1.verifyEmailService)(token);
            (0, async_handler_middleware_1.successResponse)(res, result, "Email verified successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    async forgotPasswordController(req, res) {
        try {
            const result = await (0, forgot_password_service_1.forgotPasswordService)(req.body);
            (0, async_handler_middleware_1.successResponse)(res, result, "Password reset email sent");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    async resetPasswordController(req, res) {
        try {
            const result = await (0, reset_password_service_1.resetPasswordService)(req.body);
            (0, async_handler_middleware_1.successResponse)(res, result, "Password reset successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    async googleTokenController(req, res) {
        try {
            const result = await (0, google_token_service_1.googleTokenService)(req.body);
            (0, async_handler_middleware_1.successResponse)(res, result, "Google login successful");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    async getSessionController(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return (0, async_handler_middleware_1.errorResponse)(res, "User not authenticated", 401);
            }
            const result = await (0, get_session_service_1.getSessionService)({ userId });
            (0, async_handler_middleware_1.successResponse)(res, result, "Session retrieved successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    async verifyEmailChangeController(req, res) {
        try {
            const { token } = req.query;
            const result = await (0, verify_email_change_service_1.verifyEmailChangeService)(token);
            (0, async_handler_middleware_1.successResponse)(res, result, "Email change verified successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
}
exports.AuthController = AuthController;
