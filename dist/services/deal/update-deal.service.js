"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDealService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const updateDealService = async (data) => {
    const { id, title, description, type, value, startDate, endDate, image, images, isFlashSale, maxUses, status, } = data;
    // Handle empty image string
    const imageUrl = image && image.trim() ? image.trim() : undefined;
    // Check if deal exists
    const existingDeal = await prisma_1.default.deal.findUnique({
        where: { id },
    });
    if (!existingDeal) {
        throw new Error("Deal not found");
    }
    // Validate dates if provided
    if (startDate && endDate && startDate >= endDate) {
        throw new Error("Start date must be before end date");
    }
    // Validate value based on type
    if (type === "PERCENTAGE" &&
        value !== undefined &&
        (value < 0 || value > 100)) {
        throw new Error("Percentage value must be between 0 and 100");
    }
    if (type === "FIXED_AMOUNT" && value !== undefined && value < 0) {
        throw new Error("Fixed amount value must be positive");
    }
    // Update deal
    const deal = await prisma_1.default.$transaction(async (tx) => {
        const updatedDeal = await tx.deal.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(description !== undefined && { description }),
                ...(type && { type }),
                ...(value !== undefined && { value }),
                ...(startDate && { startDate }),
                ...(endDate && { endDate }),
                ...(image !== undefined && { image: imageUrl }),
                ...(isFlashSale !== undefined && { isFlashSale }),
                ...(maxUses !== undefined && { maxUses }),
                ...(status && { status }),
            },
        });
        // Update images if provided
        if (images !== undefined) {
            // Remove existing images
            await tx.dealImage.deleteMany({
                where: { dealId: id },
            });
            // Add new images
            if (images.length > 0) {
                await tx.dealImage.createMany({
                    data: images.map((url) => ({
                        dealId: id,
                        url,
                    })),
                });
            }
        }
        return updatedDeal;
    });
    return {
        success: true,
        message: "Deal updated successfully",
        data: deal,
    };
};
exports.updateDealService = updateDealService;
