"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAddressService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const deleteAddressService = async (params) => {
    const { addressId, userId } = params;
    // Check if address exists and belongs to user
    const existingAddress = await prisma_1.default.address.findFirst({
        where: {
            id: addressId,
            userId: userId,
        },
    });
    if (!existingAddress) {
        throw new Error("Address not found or does not belong to user");
    }
    // Delete the address
    await prisma_1.default.address.delete({
        where: {
            id: addressId,
        },
    });
    return true;
};
exports.deleteAddressService = deleteAddressService;
