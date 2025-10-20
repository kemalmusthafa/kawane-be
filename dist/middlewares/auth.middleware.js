"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireStaff = exports.requireAdmin = exports.requireAuth = exports.authorizeRoles = exports.authenticateToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const config_1 = require("../utils/config");
const authenticateToken = (req, res, next) => {
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
        const decoded = (0, jsonwebtoken_1.verify)(token, config_1.appConfig.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(403).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};
exports.authenticateToken = authenticateToken;
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
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
exports.authorizeRoles = authorizeRoles;
exports.requireAuth = exports.authenticateToken;
exports.requireAdmin = (0, exports.authorizeRoles)("ADMIN");
exports.requireStaff = (0, exports.authorizeRoles)("ADMIN", "STAFF");
