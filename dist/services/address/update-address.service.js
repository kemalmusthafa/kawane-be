"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAddressService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const updateAddressService = async (params) => {
    const { addressId, userId, ...updateData } = params;
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
    // If setting as default, unset other default addresses
    // Note: isDefault field will be available after database migration
    if (updateData.isDefault) {
        // await prisma.address.updateMany({
        //   where: {
        //     userId: userId,
        //     isDefault: true,
        //   },
        //   data: {
        //     isDefault: false,
        //   },
        // });
    }
    // Update the address (excluding isDefault for now)
    const { isDefault, ...updateDataWithoutDefault } = updateData;
    const updatedAddress = await prisma_1.default.address.update({
        where: {
            id: addressId,
        },
        data: updateDataWithoutDefault,
    });
    return updatedAddress;
};
exports.updateAddressService = updateAddressService;
