"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const deal_expiration_controller_1 = require("../controllers/deal-expiration.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Admin only routes for deal expiration management
router.post("/expire", auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)("ADMIN"), deal_expiration_controller_1.expireDealsController);
router.post("/cleanup", auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)("ADMIN"), deal_expiration_controller_1.cleanupExpiredDealsController);
router.post("/process", auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRoles)("ADMIN"), deal_expiration_controller_1.processExpiredDealsController);
exports.default = router;
