import { Router } from "express";
import {
  getAllLookbookPhotos,
  getLookbookPhoto,
  createLookbookPhoto,
  updateLookbookPhoto,
  deleteLookbookPhoto,
  updateLookbookPhotosOrder,
  uploadLookbookImage,
} from "../controllers/lookbook.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
import { validateBody } from "../middlewares/zod-validation.middleware";
import { uploadLookbookCloudinary } from "../services/lookbook/upload-lookbook-image-cloudinary-multer.service";
import { z } from "zod";

const router = Router();

// Public routes
router.get("/", getAllLookbookPhotos);
router.get("/:id", getLookbookPhoto);

// Protected routes (Admin only)
router.post(
  "/",
  authenticateToken,
  validateBody(
    z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      imageUrl: z.string().min(1, "Image URL harus diisi"),
      order: z.number().int().min(0).optional(),
      isActive: z.boolean().optional(),
    })
  ),
  createLookbookPhoto
);

router.put(
  "/:id",
  authenticateToken,
  validateBody(
    z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      imageUrl: z.string().min(1, "Image URL harus diisi").optional(),
      order: z.number().int().min(0).optional(),
      isActive: z.boolean().optional(),
    })
  ),
  updateLookbookPhoto
);

router.delete("/:id", authenticateToken, deleteLookbookPhoto);

router.put(
  "/order/update",
  authenticateToken,
  validateBody(
    z.object({
      photos: z.array(
        z.object({
          id: z.string(),
          order: z.number().int().min(0),
        })
      ),
    })
  ),
  updateLookbookPhotosOrder
);

// Upload lookbook image (Admin only)
router.post(
  "/upload-image",
  authenticateToken,
  uploadLookbookCloudinary.single("image"),
  uploadLookbookImage
);

export default router;
