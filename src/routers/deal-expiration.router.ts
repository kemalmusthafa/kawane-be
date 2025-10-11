import { Router } from "express";
import {
  expireDealsController,
  cleanupExpiredDealsController,
  processExpiredDealsController,
} from "../controllers/deal-expiration.controller";
import {
  authenticateToken,
  authorizeRoles,
} from "../middlewares/auth.middleware";

const router = Router();

// Admin only routes for deal expiration management
router.post(
  "/expire",
  authenticateToken,
  authorizeRoles("ADMIN"),
  expireDealsController
);
router.post(
  "/cleanup",
  authenticateToken,
  authorizeRoles("ADMIN"),
  cleanupExpiredDealsController
);
router.post(
  "/process",
  authenticateToken,
  authorizeRoles("ADMIN"),
  processExpiredDealsController
);

export default router;
