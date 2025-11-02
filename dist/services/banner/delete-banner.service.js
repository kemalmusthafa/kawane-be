"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBannerService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const deleteBannerService = async (bannerId) => {
    // Check if banner exists
    const existingBanner = await prisma_1.default.banner.findUnique({
        where: { id: bannerId },
    });
    if (!existingBanner) {
        throw new Error("Banner not found");
    }
    await prisma_1.default.banner.delete({
        where: { id: bannerId },
    });
    return { success: true };
};
exports.deleteBannerService = deleteBannerService;
