"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDealByIdService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const getDealByIdService = async (params) => {
    const { id } = params;
    const deal = await prisma_1.default.deal.findUnique({
        where: { id },
        include: {
            images: true,
            dealProducts: {
                include: {
                    product: {
                        include: {
                            images: true,
                            category: true,
                        },
                    },
                },
            },
        },
    });
    if (!deal) {
        throw new Error("Deal not found");
    }
    // Calculate discounted prices for each product
    const dealWithDiscountedPrices = {
        ...deal,
        dealProducts: deal.dealProducts.map((dealProduct) => {
            const product = dealProduct.product;
            let discountedPrice = product.price;
            if (deal.type === "PERCENTAGE") {
                discountedPrice = product.price * (1 - deal.value / 100);
            }
            else if (deal.type === "FIXED_AMOUNT") {
                discountedPrice = Math.max(0, product.price - deal.value);
            }
            return {
                ...dealProduct,
                product: {
                    ...product,
                    originalPrice: product.price,
                    discountedPrice: Math.round(discountedPrice * 100) / 100,
                    discountAmount: product.price - discountedPrice,
                    discountPercentage: Math.round(((product.price - discountedPrice) / product.price) * 100),
                },
            };
        }),
    };
    return {
        success: true,
        message: "Deal retrieved successfully",
        data: dealWithDiscountedPrices,
    };
};
exports.getDealByIdService = getDealByIdService;
