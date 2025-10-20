"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAddressService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const createAddressService = async (data) => {
    const user = await prisma_1.default.user.findUnique({
        where: { id: data.userId },
    });
    if (!user)
        throw new Error("User not found");
    if (data.latitude && (data.latitude < -90 || data.latitude > 90)) {
        throw new Error("Invalid latitude value");
    }
    if (data.longitude && (data.longitude < -180 || data.longitude > 180)) {
        throw new Error("Invalid longitude value");
    }
    const address = await prisma_1.default.address.create({
        data: {
            userId: data.userId,
            label: data.label,
            detail: data.detail,
            city: data.city,
            province: data.province,
            postalCode: data.postalCode,
            latitude: data.latitude,
            longitude: data.longitude,
        },
    });
    return address;
};
exports.createAddressService = createAddressService;
