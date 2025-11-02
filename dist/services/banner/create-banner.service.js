"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBannerService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const createBannerService = async (data) => {
    if (!data.text.trim()) {
        throw new Error("Banner text is required");
    }
    // Validate priority range
    const priority = data.priority || 1;
    if (priority < 1 || priority > 10) {
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
    const banner = await prisma_1.default.banner.create({
        data: {
            text: data.text.trim(),
            isActive: data.isActive ?? true,
            backgroundColor: data.backgroundColor,
            textColor: data.textColor,
            linkUrl: data.linkUrl,
            linkText: data.linkText,
            dealId: data.dealId,
            priority,
            duration: data.duration,
        },
    });
    return banner;
};
exports.createBannerService = createBannerService;
