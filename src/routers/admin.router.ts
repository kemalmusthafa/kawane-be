import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { OrderController } from "../controllers/order.controller";
import { AdminNotificationRouter } from "./admin-notification.router";
import {
  requireAuth,
  requireAdmin,
  requireStaff,
} from "../middlewares/auth.middleware";
import {
  validateBody,
  validateQuery,
} from "../middlewares/zod-validation.middleware";
import {
  createAdminSchema,
  createStaffSchema,
  orderQuerySchema,
} from "../utils/validation-schemas";

export class AdminRouter {
  private router: Router;
  private adminController: AdminController;
  private orderController: OrderController;
  private adminNotificationRouter: AdminNotificationRouter;

  constructor() {
    this.router = Router();
    this.adminController = new AdminController();
    this.orderController = new OrderController();
    this.adminNotificationRouter = new AdminNotificationRouter();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Create new admin (Super Admin only)
    this.router.post(
      "/create-admin",
      requireAuth,
      requireAdmin,
      validateBody(createAdminSchema),
      this.adminController.createAdminController
    );

    // Create new staff (Admin only)
    this.router.post(
      "/create-staff",
      requireAuth,
      requireAdmin,
      validateBody(createStaffSchema),
      this.adminController.createStaffController
    );

    // Get all orders (Admin/Staff only)
    this.router.get(
      "/orders",
      requireAuth,
      requireStaff,
      validateQuery(orderQuerySchema),
      this.orderController.getAllOrdersController
    );

    // Admin notifications routes
    this.router.use("/notifications", this.adminNotificationRouter.getRouter());
  }

  public getRouter(): Router {
    return this.router;
  }
}
