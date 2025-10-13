"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const create_order_service_1 = require("../services/order/create-order.service");
const get_user_orders_service_1 = require("../services/order/get-user-orders.service");
const get_all_orders_service_1 = require("../services/order/get-all-orders.service");
const update_order_status_service_1 = require("../services/order/update-order-status.service");
const get_order_detail_service_1 = require("../services/order/get-order-detail.service");
const cancel_order_service_1 = require("../services/order/cancel-order.service");
const async_handler_middleware_1 = require("../middlewares/async-handler.middleware");
class OrderController {
    async createOrderController(req, res) {
        try {
            const userId = req.user.id;
            const { items, totalAmount, shippingAddress, paymentMethod, addressId, notes, } = req.body;
            // Use the existing createOrderService with multiple products
            const order = await (0, create_order_service_1.createOrderService)({
                userId,
                items: items,
                addressId: addressId || "temp-address", // We'll handle address creation in service
                totalAmount, // Pass totalAmount from frontend
            });
            (0, async_handler_middleware_1.successResponse)(res, {
                orderId: order.id,
                orderNumber: order.id, // Using order ID as order number for now
                totalAmount: order.totalAmount,
                status: order.status,
                paymentUrl: order.paymentUrl,
                paymentToken: order.paymentToken,
            }, "Order created successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    async getUserOrdersController(req, res) {
        try {
            const userId = req.user.id;
            // Use validated query data if available, otherwise fallback to req.query
            const queryData = req.validatedQuery || req.query;
            const { status, page, limit } = queryData;
            const result = await (0, get_user_orders_service_1.getUserOrdersService)({
                userId,
                status: status,
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 10,
            });
            (0, async_handler_middleware_1.successResponse)(res, result, "Orders retrieved successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    async getAllOrdersController(req, res) {
        try {
            // Use validated query data if available, otherwise fallback to req.query
            const queryData = req.validatedQuery || req.query;
            const { status, page, limit, search } = queryData;
            const result = await (0, get_all_orders_service_1.getAllOrdersService)({
                status: status,
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 10,
                search: search,
            });
            (0, async_handler_middleware_1.successResponse)(res, result, "All orders retrieved successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    async updateOrderStatusController(req, res) {
        try {
            // Use validated params data if available, otherwise fallback to req.params
            const paramsData = req.validatedParams || req.params;
            const { orderId } = paramsData;
            const { status } = req.body;
            const order = await (0, update_order_status_service_1.updateOrderStatusService)({
                orderId,
                status,
            });
            (0, async_handler_middleware_1.successResponse)(res, order, "Order status updated successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    async getOrderDetailController(req, res) {
        try {
            const userId = req.user.id;
            // Use validated params data if available, otherwise fallback to req.params
            const paramsData = req.validatedParams || req.params;
            const { orderId } = paramsData;
            const order = await (0, get_order_detail_service_1.getOrderDetailService)({
                orderId,
                userId,
            });
            (0, async_handler_middleware_1.successResponse)(res, order, "Order detail retrieved successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
    async cancelOrderController(req, res) {
        try {
            const userId = req.user.id;
            // Use validated params data if available, otherwise fallback to req.params
            const paramsData = req.validatedParams || req.params;
            const { orderId } = paramsData;
            const result = await (0, cancel_order_service_1.cancelOrderService)({
                orderId,
                userId,
            });
            (0, async_handler_middleware_1.successResponse)(res, result, "Order cancelled successfully");
        }
        catch (error) {
            (0, async_handler_middleware_1.errorResponse)(res, error.message, 400);
        }
    }
}
exports.OrderController = OrderController;
