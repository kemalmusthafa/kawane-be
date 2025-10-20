import { cloudinaryUpload } from "../shared/cloudinary";

export const uploadDealImageCloudinaryService = async (
  file: Express.Multer.File
) => {
  try {
    // Validasi file
    if (!file) {
      throw new Error("No image file provided");
    }

    // Validasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File size too large. Maximum 5MB allowed");
    }

    // Validasi tipe file
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (!mimetype || !extname) {
      throw new Error("Invalid file type. Only image files are allowed");
    }

    // Upload ke Cloudinary
    const uploadResult = await cloudinaryUpload(file, "deals");

    // Return informasi file yang berhasil diupload
    return {
      success: true,
      message: "Deal image uploaded successfully",
      data: {
        filename: uploadResult.public_id,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        path: uploadResult.secure_url,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        cloudinaryData: uploadResult,
      },
    };
  } catch (error: any) {
    console.error("Error uploading deal image to Cloudinary:", error);
    throw new Error(error.message || "Failed to upload deal image");
  }
};


