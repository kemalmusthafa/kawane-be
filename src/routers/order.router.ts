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
  createWhatsAppOrderSchema,
  updateWhatsAppOrderStatusSchema,
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

    // Get all orders (Admin only)
    this.router.get(
      "/admin",
      requireAuth,
      requireStaff,
      validateQuery(orderQuerySchema),
      this.orderController.getAllOrdersController
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

    // Cancel order (Customer only)
    this.router.put(
      "/:orderId/cancel",
      requireAuth,
      validateParams(orderIdParamSchema),
      this.orderController.cancelOrderController
    );

    // WhatsApp Order Routes
    // Create WhatsApp order
    this.router.post(
      "/whatsapp",
      requireAuth,
      validateBody(createWhatsAppOrderSchema),
      this.orderController.createWhatsAppOrderController
    );

    // Get WhatsApp orders (Admin/Staff only)
    this.router.get(
      "/whatsapp",
      requireAuth,
      requireStaff,
      this.orderController.getWhatsAppOrdersController
    );

    // Update WhatsApp order status (Admin/Staff only)
    this.router.put(
      "/whatsapp/:orderId/status",
      requireAuth,
      requireStaff,
      validateParams(orderIdParamSchema),
      validateBody(updateWhatsAppOrderStatusSchema),
      this.orderController.updateWhatsAppOrderStatusController
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
