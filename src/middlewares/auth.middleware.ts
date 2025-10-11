import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import { appConfig } from "../utils/config";
import { Role } from "../../prisma/generated/client";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: Role;
  };
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token required",
    });
  }

  try {
    // Fix JWT_SECRET reference dan type assertion
    const decoded = verify(token, appConfig.JWT_SECRET as string) as {
      id: string;
      role: Role;
    };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export const authorizeRoles = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    }

    next();
  };
};

export const requireAuth = authenticateToken;
export const requireAdmin = authorizeRoles("ADMIN");
export const requireStaff = authorizeRoles("ADMIN", "STAFF");
