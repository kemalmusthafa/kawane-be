"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportOrdersService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const exportOrdersService = async (params = {}) => {
    const { startDate, endDate, status, format = "json" } = params;
    const filter = {};
    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate)
            filter.createdAt.gte = startDate;
        if (endDate)
            filter.createdAt.lte = endDate;
    }
    if (status)
        filter.status = status;
    const orders = await prisma_1.default.order.findMany({
        where: filter,
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    phone: true,
                },
            },
            items: {
                include: {
                    product: {
                        select: {
                            name: true,
                            sku: true,
                        },
                    },
                },
            },
            payment: true,
            shipment: true,
            address: true,
        },
        orderBy: { createdAt: "desc" },
    });
    const exportData = orders.map((order) => ({
        orderId: order.id,
        customerName: order.user.name,
        customerEmail: order.user.email,
        customerPhone: order.user.phone,
        status: order.status,
        totalAmount: order.totalAmount,
        paymentMethod: order.payment?.method || "N/A",
        paymentStatus: order.payment?.status || "N/A",
        courier: order.shipment?.courier || "N/A",
        trackingNumber: order.shipment?.trackingNo || "N/A",
        shippingAddress: order.address
            ? `${order.address.detail}, ${order.address.city}, ${order.address.province}`
            : "N/A",
        items: order.items
            .map((item) => `${item.product.name} (${item.quantity}x @$${item.price})`)
            .join("; "),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
    }));
    if (format === "csv") {
        const headers = [
            "Order ID",
            "Customer Name",
            "Customer Email",
            "Customer Phone",
            "Status",
            "Total Amount",
            "Payment Method",
            "Payment Status",
            "Courier",
            "Tracking Number",
            "Shipping Address",
            "Items",
            "Created At",
            "Updated At",
        ];
        const csvContent = [
            headers.join(","),
            ...exportData.map((row) => [
                row.orderId,
                `"${row.customerName}"`,
                `"${row.customerEmail}"`,
                `"${row.customerPhone || ""}"`,
                row.status,
                row.totalAmount,
                row.paymentMethod,
                row.paymentStatus,
                `"${row.courier}"`,
                `"${row.trackingNumber}"`,
                `"${row.shippingAddress}"`,
                `"${row.items}"`,
                row.createdAt.toISOString(),
                row.updatedAt.toISOString(),
            ].join(",")),
        ].join("\n");
        return {
            data: csvContent,
            filename: `orders_${new Date().toISOString().split("T")[0]}.csv`,
            contentType: "text/csv",
        };
    }
    return {
        data: exportData,
        filename: `orders_${new Date().toISOString().split("T")[0]}.json`,
        contentType: "application/json",
    };
};
exports.exportOrdersService = exportOrdersService;
