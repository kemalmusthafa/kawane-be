import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { requireAuth, requireStaff } from "../middlewares/auth.middleware";
import {
  validateBody,
  validateQuery,
  validateParams,
} from "../middlewares/zod-validation.middleware";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  orderQuerySchema,
  orderIdParamSchema,
} from "../utils/validation-schemas";

export class OrderRouter {
  private router: Router;
  private orderController: OrderController;

  constructor() {
    this.router = Router();
    this.orderController = new OrderController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get user orders with pagination
    this.router.get(
      "/",
      requireAuth,
      validateQuery(orderQuerySchema),
      this.orderController.getUserOrdersController
    );

    // Create new order
    this.router.post(
      "/",
      requireAuth,
      validateBody(createOrderSchema),
      this.orderController.createOrderController
    );

    // Get order detail by ID
    this.router.get(
      "/:orderId",
      requireAuth,
      validateParams(orderIdParamSchema),
      this.orderController.getOrderDetailController
    );

    // Update order status (Staff/Admin only)
    this.router.put(
      "/:orderId/status",
      requireAuth,
      requireStaff,
      validateParams(orderIdParamSchema),
      validateBody(updateOrderStatusSchema),
      this.orderController.updateOrderStatusController
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
