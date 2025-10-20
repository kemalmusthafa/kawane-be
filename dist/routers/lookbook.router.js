"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lookbook_controller_1 = require("../controllers/lookbook.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const zod_validation_middleware_1 = require("../middlewares/zod-validation.middleware");
const upload_lookbook_image_cloudinary_multer_service_1 = require("../services/lookbook/upload-lookbook-image-cloudinary-multer.service");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// Public routes
router.get("/", lookbook_controller_1.getAllLookbookPhotos);
router.get("/:id", lookbook_controller_1.getLookbookPhoto);
// Protected routes (Admin only)
router.post("/", auth_middleware_1.authenticateToken, (0, zod_validation_middleware_1.validateBody)(zod_1.z.object({
    title: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    imageUrl: zod_1.z.string().min(1, "Image URL harus diisi"),
    order: zod_1.z.number().int().min(0).optional(),
    isActive: zod_1.z.boolean().optional(),
})), lookbook_controller_1.createLookbookPhoto);
router.put("/:id", auth_middleware_1.authenticateToken, (0, zod_validation_middleware_1.validateBody)(zod_1.z.object({
    title: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    imageUrl: zod_1.z.string().min(1, "Image URL harus diisi").optional(),
    order: zod_1.z.number().int().min(0).optional(),
    isActive: zod_1.z.boolean().optional(),
})), lookbook_controller_1.updateLookbookPhoto);
router.delete("/:id", auth_middleware_1.authenticateToken, lookbook_controller_1.deleteLookbookPhoto);
router.put("/order/update", auth_middleware_1.authenticateToken, (0, zod_validation_middleware_1.validateBody)(zod_1.z.object({
    photos: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        order: zod_1.z.number().int().min(0),
    })),
})), lookbook_controller_1.updateLookbookPhotosOrder);
// Upload lookbook image (Admin only)
router.post("/upload-image", auth_middleware_1.authenticateToken, upload_lookbook_image_cloudinary_multer_service_1.uploadLookbookCloudinary.single("image"), lookbook_controller_1.uploadLookbookImage);
exports.default = router;
