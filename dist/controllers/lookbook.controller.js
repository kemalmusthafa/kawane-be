"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadLookbookImage = exports.updateLookbookPhotosOrder = exports.deleteLookbookPhoto = exports.updateLookbookPhoto = exports.createLookbookPhoto = exports.getLookbookPhoto = exports.getAllLookbookPhotos = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const async_handler_middleware_1 = require("../middlewares/async-handler.middleware");
const upload_lookbook_image_cloudinary_service_1 = require("../services/lookbook/upload-lookbook-image-cloudinary.service");
const zod_1 = require("zod");
// Validation schemas
const createLookbookPhotoSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    imageUrl: zod_1.z.string().min(1, "Image URL harus diisi"),
    order: zod_1.z.number().int().min(0).optional(),
    isActive: zod_1.z.boolean().optional(),
});
const updateLookbookPhotoSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    imageUrl: zod_1.z.string().min(1, "Image URL harus diisi").optional(),
    order: zod_1.z.number().int().min(0).optional(),
    isActive: zod_1.z.boolean().optional(),
});
// Get all lookbook photos
exports.getAllLookbookPhotos = (0, async_handler_middleware_1.asyncHandler)(async (req, res) => {
    const { isActive } = req.query;
    const where = {};
    if (isActive !== undefined) {
        where.isActive = isActive === "true";
    }
    const photos = await prisma_1.default.lookbookPhoto.findMany({
        where,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    res.status(200).json({
        success: true,
        data: photos,
    });
});
// Get single lookbook photo
exports.getLookbookPhoto = (0, async_handler_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const photo = await prisma_1.default.lookbookPhoto.findUnique({
        where: { id },
    });
    if (!photo) {
        return res.status(404).json({
            success: false,
            message: "Lookbook photo tidak ditemukan",
        });
    }
    res.status(200).json({
        success: true,
        data: photo,
    });
});
// Create new lookbook photo
exports.createLookbookPhoto = (0, async_handler_middleware_1.asyncHandler)(async (req, res) => {
    const validatedData = createLookbookPhotoSchema.parse(req.body);
    const photo = await prisma_1.default.lookbookPhoto.create({
        data: {
            ...validatedData,
            order: validatedData.order ?? 0,
            isActive: validatedData.isActive ?? true,
        },
    });
    res.status(201).json({
        success: true,
        message: "Lookbook photo berhasil dibuat",
        data: photo,
    });
});
// Update lookbook photo
exports.updateLookbookPhoto = (0, async_handler_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const validatedData = updateLookbookPhotoSchema.parse(req.body);
    const existingPhoto = await prisma_1.default.lookbookPhoto.findUnique({
        where: { id },
    });
    if (!existingPhoto) {
        return res.status(404).json({
            success: false,
            message: "Lookbook photo tidak ditemukan",
        });
    }
    const photo = await prisma_1.default.lookbookPhoto.update({
        where: { id },
        data: validatedData,
    });
    res.status(200).json({
        success: true,
        message: "Lookbook photo berhasil diperbarui",
        data: photo,
    });
});
// Delete lookbook photo
exports.deleteLookbookPhoto = (0, async_handler_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const existingPhoto = await prisma_1.default.lookbookPhoto.findUnique({
        where: { id },
    });
    if (!existingPhoto) {
        return res.status(404).json({
            success: false,
            message: "Lookbook photo tidak ditemukan",
        });
    }
    await prisma_1.default.lookbookPhoto.delete({
        where: { id },
    });
    res.status(200).json({
        success: true,
        message: "Lookbook photo berhasil dihapus",
    });
});
// Update order of lookbook photos
exports.updateLookbookPhotosOrder = (0, async_handler_middleware_1.asyncHandler)(async (req, res) => {
    const { photos } = req.body;
    if (!Array.isArray(photos)) {
        return res.status(400).json({
            success: false,
            message: "Photos harus berupa array",
        });
    }
    // Update order for each photo
    const updatePromises = photos.map((photo) => prisma_1.default.lookbookPhoto.update({
        where: { id: photo.id },
        data: { order: photo.order },
    }));
    await Promise.all(updatePromises);
    res.status(200).json({
        success: true,
        message: "Urutan lookbook photos berhasil diperbarui",
    });
});
// Upload lookbook image
exports.uploadLookbookImage = (0, async_handler_middleware_1.asyncHandler)(async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({
                success: false,
                message: "No image file provided",
            });
        }
        const result = await (0, upload_lookbook_image_cloudinary_service_1.uploadLookbookImageCloudinaryService)(file);
        res.status(200).json({
            success: true,
            message: result.message,
            data: result.data,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || "Failed to upload lookbook image",
        });
    }
});
