import { Request, Response } from "express";
import prisma from "../prisma";
import { asyncHandler } from "../middlewares/async-handler.middleware";
import { uploadLookbookImageCloudinaryService } from "../services/lookbook/upload-lookbook-image-cloudinary.service";
import { z } from "zod";

// Validation schemas
const createLookbookPhotoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().min(1, "Image URL harus diisi"),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

const updateLookbookPhotoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().min(1, "Image URL harus diisi").optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

// Get all lookbook photos
export const getAllLookbookPhotos = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { isActive } = req.query;

      const where: any = {};
      if (isActive !== undefined) {
        where.isActive = isActive === "true";
      }

      const photos = await prisma.lookbookPhoto.findMany({
        where,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      });

      res.status(200).json({
        success: true,
        data: photos,
      });
    } catch (error: any) {
      console.error("Error fetching lookbook photos:", error);

      // Handle database connection errors
      if (
        error.code === "P1001" ||
        error.message.includes("Can't reach database server")
      ) {
        return res.status(503).json({
          success: false,
          message:
            "Database service temporarily unavailable. Please try again later.",
        });
      }

      throw error; // Let asyncHandler handle other errors
    }
  }
);

// Get single lookbook photo
export const getLookbookPhoto = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const photo = await prisma.lookbookPhoto.findUnique({
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
  }
);

// Create new lookbook photo
export const createLookbookPhoto = asyncHandler(
  async (req: Request, res: Response) => {
    const validatedData = createLookbookPhotoSchema.parse(req.body);

    const photo = await prisma.lookbookPhoto.create({
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
  }
);

// Update lookbook photo
export const updateLookbookPhoto = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const validatedData = updateLookbookPhotoSchema.parse(req.body);

    const existingPhoto = await prisma.lookbookPhoto.findUnique({
      where: { id },
    });

    if (!existingPhoto) {
      return res.status(404).json({
        success: false,
        message: "Lookbook photo tidak ditemukan",
      });
    }

    const photo = await prisma.lookbookPhoto.update({
      where: { id },
      data: validatedData,
    });

    res.status(200).json({
      success: true,
      message: "Lookbook photo berhasil diperbarui",
      data: photo,
    });
  }
);

// Delete lookbook photo
export const deleteLookbookPhoto = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const existingPhoto = await prisma.lookbookPhoto.findUnique({
      where: { id },
    });

    if (!existingPhoto) {
      return res.status(404).json({
        success: false,
        message: "Lookbook photo tidak ditemukan",
      });
    }

    await prisma.lookbookPhoto.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Lookbook photo berhasil dihapus",
    });
  }
);

// Update order of lookbook photos
export const updateLookbookPhotosOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const { photos } = req.body;

    if (!Array.isArray(photos)) {
      return res.status(400).json({
        success: false,
        message: "Photos harus berupa array",
      });
    }

    // Update order for each photo
    const updatePromises = photos.map((photo: { id: string; order: number }) =>
      prisma.lookbookPhoto.update({
        where: { id: photo.id },
        data: { order: photo.order },
      })
    );

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: "Urutan lookbook photos berhasil diperbarui",
    });
  }
);

// Upload lookbook image
export const uploadLookbookImage = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({
          success: false,
          message: "No image file provided",
        });
      }

      const result = await uploadLookbookImageCloudinaryService(file);
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to upload lookbook image",
      });
    }
  }
);
