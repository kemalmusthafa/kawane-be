"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDealService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const deleteDealService = async (params) => {
    const { id } = params;
    // Check if deal exists
    const existingDeal = await prisma_1.default.deal.findUnique({
        where: { id },
    });
    if (!existingDeal) {
        throw new Error("Deal not found");
    }
    // Delete deal (cascade will handle DealProduct deletion)
    await prisma_1.default.deal.delete({
        where: { id },
    });
    return {
        success: true,
        message: "Deal deleted successfully",
    };
};
exports.deleteDealService = deleteDealService;
