import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

// ========================================
// 🔍 ZOD VALIDATION MIDDLEWARE
// ========================================

/**
 * Middleware untuk validate request body, query, dan params menggunakan Zod schema
 * @param schema - Zod schema untuk validation
 * @param target - Target yang mau di-validate ('body', 'query', 'params', atau 'all')
 */
export const validateZod = (
  schema: ZodSchema,
  target: "body" | "query" | "params" | "all" = "body"
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let data: any;

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
          (req as any).validatedQuery = validatedData;
          break;
        case "params":
          // req.params is read-only, so we attach validated data to req object
          (req as any).validatedParams = validatedData;
          break;
        case "all":
          const allData = validatedData as any;
          req.body = allData.body;
          (req as any).validatedQuery = allData.query;
          (req as any).validatedParams = allData.params;
          break;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod error messages dengan proper typing
        const zodError = error as ZodError;
        const errorMessages =
          zodError.issues?.map((issue: any) => ({
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

// ========================================
// 🎯 CONVENIENCE FUNCTIONS
// ========================================

/**
 * Validate request body
 */
export const validateBody = (schema: ZodSchema) => validateZod(schema, "body");

/**
 * Validate request query parameters
 */
export const validateQuery = (schema: ZodSchema) =>
  validateZod(schema, "query");

/**
 * Validate request URL parameters
 */
export const validateParams = (schema: ZodSchema) =>
  validateZod(schema, "params");

/**
 * Validate all request data (body, query, params)
 */
export const validateAll = (schema: ZodSchema) => validateZod(schema, "all");

// ========================================
// 🔧 CUSTOM VALIDATION HELPERS
// ========================================

/**
 * Validate UUID format
 */
export const validateUUID = (value: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone);
};

/**
 * Validate password strength
 */
export const validatePassword = (
  password: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

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

// ========================================
// 📊 VALIDATION STATISTICS
// ========================================

let validationStats = {
  totalRequests: 0,
  validationErrors: 0,
  successfulValidations: 0,
};

export const getValidationStats = () => ({ ...validationStats });

export const resetValidationStats = () => {
  validationStats = {
    totalRequests: 0,
    validationErrors: 0,
    successfulValidations: 0,
  };
};
