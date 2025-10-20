"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetValidationStats = exports.getValidationStats = exports.validatePassword = exports.validatePhone = exports.validateEmail = exports.validateUUID = exports.validateAll = exports.validateParams = exports.validateQuery = exports.validateBody = exports.validateZod = void 0;
const zod_1 = require("zod");
// ========================================
// 🔍 ZOD VALIDATION MIDDLEWARE
// ========================================
/**
 * Middleware untuk validate request body, query, dan params menggunakan Zod schema
 * @param schema - Zod schema untuk validation
 * @param target - Target yang mau di-validate ('body', 'query', 'params', atau 'all')
 */
const validateZod = (schema, target = "body") => {
    return async (req, res, next) => {
        try {
            let data;
            switch (target) {
                case "body":
                    data = req.body;
                    break;
                case "query":
                    data = req.query;
                    break;
                case "params":
                    data = req.params;
                    break;
                case "all":
                    data = {
                        body: req.body,
                        query: req.query,
                        params: req.params,
                    };
                    break;
                default:
                    data = req.body;
            }
            // Validate data dengan Zod schema
            const validatedData = await schema.parseAsync(data);
            // Replace data dengan validated data
            switch (target) {
                case "body":
                    req.body = validatedData;
                    break;
                case "query":
                    // req.query is read-only, so we attach validated data to req object
                    req.validatedQuery = validatedData;
                    break;
                case "params":
                    // req.params is read-only, so we attach validated data to req object
                    req.validatedParams = validatedData;
                    break;
                case "all":
                    const allData = validatedData;
                    req.body = allData.body;
                    req.validatedQuery = allData.query;
                    req.validatedParams = allData.params;
                    break;
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                // Format Zod error messages dengan proper typing
                const zodError = error;
                const errorMessages = zodError.issues?.map((issue) => ({
                    field: issue.path?.join(".") || "unknown",
                    message: issue.message || "Validation error",
                    code: issue.code || "invalid_type",
                })) || [];
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: errorMessages,
                    details: {
                        totalErrors: errorMessages.length,
                        validationType: target,
                    },
                });
            }
            // Handle unexpected errors
            console.error("Zod validation error:", error);
            return res.status(500).json({
                success: false,
                message: "Internal validation error",
            });
        }
    };
};
exports.validateZod = validateZod;
// ========================================
// 🎯 CONVENIENCE FUNCTIONS
// ========================================
/**
 * Validate request body
 */
const validateBody = (schema) => (0, exports.validateZod)(schema, "body");
exports.validateBody = validateBody;
/**
 * Validate request query parameters
 */
const validateQuery = (schema) => (0, exports.validateZod)(schema, "query");
exports.validateQuery = validateQuery;
/**
 * Validate request URL parameters
 */
const validateParams = (schema) => (0, exports.validateZod)(schema, "params");
exports.validateParams = validateParams;
/**
 * Validate all request data (body, query, params)
 */
const validateAll = (schema) => (0, exports.validateZod)(schema, "all");
exports.validateAll = validateAll;
// ========================================
// 🔧 CUSTOM VALIDATION HELPERS
// ========================================
/**
 * Validate UUID format
 */
const validateUUID = (value) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
};
exports.validateUUID = validateUUID;
/**
 * Validate email format
 */
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
/**
 * Validate phone number format
 */
const validatePhone = (phone) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone);
};
exports.validatePhone = validatePhone;
/**
 * Validate password strength
 */
const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
        errors.push("Password must be at least 8 characters long");
    }
    if (!/(?=.*[a-z])/.test(password)) {
        errors.push("Password must contain at least one lowercase letter");
    }
    if (!/(?=.*[A-Z])/.test(password)) {
        errors.push("Password must contain at least one uppercase letter");
    }
    if (!/(?=.*\d)/.test(password)) {
        errors.push("Password must contain at least one number");
    }
    return {
        isValid: errors.length === 0,
        errors,
    };
};
exports.validatePassword = validatePassword;
// ========================================
// 📊 VALIDATION STATISTICS
// ========================================
let validationStats = {
    totalRequests: 0,
    validationErrors: 0,
    successfulValidations: 0,
};
const getValidationStats = () => ({ ...validationStats });
exports.getValidationStats = getValidationStats;
const resetValidationStats = () => {
    validationStats = {
        totalRequests: 0,
        validationErrors: 0,
        successfulValidations: 0,
    };
};
exports.resetValidationStats = resetValidationStats;
