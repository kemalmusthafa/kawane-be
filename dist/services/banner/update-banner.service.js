"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBannerService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const updateBannerService = async (bannerId, data) => {
    // Check if banner exists
    const existingBanner = await prisma_1.default.banner.findUnique({
        where: { id: bannerId },
    });
    if (!existingBanner) {
        throw new Error("Banner not found");
    }
    // Validate priority range if provided
    if (data.priority !== undefined && (data.priority < 1 || data.priority > 10)) {
        throw new Error("Priority must be between 1 and 10");
    }
    // Validate dealId if provided
    if (data.dealId) {
        const deal = await prisma_1.default.deal.findUnique({
            where: { id: data.dealId },
        });
        if (!deal) {
            throw new Error("Deal not found");
        }
    }
    const updateData = {};
    if (data.text !== undefined) {
        if (!data.text.trim()) {
            throw new Error("Banner text cannot be empty");
        }
        updateData.text = data.text.trim();
    }
    if (data.isActive !== undefined)
        updateData.isActive = data.isActive;
    if (data.backgroundColor !== undefined)
        updateData.backgroundColor = data.backgroundColor;
    if (data.textColor !== undefined)
        updateData.textColor = data.textColor;
    if (data.linkUrl !== undefined)
        updateData.linkUrl = data.linkUrl;
    if (data.linkText !== undefined)
        updateData.linkText = data.linkText;
    if (data.dealId !== undefined)
        updateData.dealId = data.dealId;
    if (data.priority !== undefined)
        updateData.priority = data.priority;
    if (data.duration !== undefined)
        updateData.duration = data.duration;
    const banner = await prisma_1.default.banner.update({
        where: { id: bannerId },
        data: updateData,
    });
    return banner;
};
exports.updateBannerService = updateBannerService;
