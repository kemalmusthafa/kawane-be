import prisma from "../../prisma";
import { DealType, DealStatus } from "../../../prisma/generated/client";

interface UpdateDealData {
  id: string;
  title?: string;
  description?: string;
  type?: DealType;
  value?: number;
  startDate?: Date;
  endDate?: Date;
  image?: string;
  images?: string[];
  isFlashSale?: boolean;
  maxUses?: number;
  status?: DealStatus;
}

export const updateDealService = async (data: UpdateDealData) => {
  const {
    id,
    title,
    description,
    type,
    value,
    startDate,
    endDate,
    image,
    images,
    isFlashSale,
    maxUses,
    status,
  } = data;

  // Handle empty image string
  const imageUrl = image && image.trim() ? image.trim() : undefined;

  // Check if deal exists
  const existingDeal = await prisma.deal.findUnique({
    where: { id },
  });

  if (!existingDeal) {
    throw new Error("Deal not found");
  }

  // Validate dates if provided
  if (startDate && endDate && startDate >= endDate) {
    throw new Error("Start date must be before end date");
  }

  // Validate value based on type
  if (
    type === "PERCENTAGE" &&
    value !== undefined &&
    (value < 0 || value > 100)
  ) {
    throw new Error("Percentage value must be between 0 and 100");
  }

  if (type === "FIXED_AMOUNT" && value !== undefined && value < 0) {
    throw new Error("Fixed amount value must be positive");
  }

  // Update deal
  const deal = await prisma.$transaction(async (tx) => {
    const updatedDeal = await tx.deal.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(type && { type }),
        ...(value !== undefined && { value }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(image !== undefined && { image: imageUrl }),
        ...(isFlashSale !== undefined && { isFlashSale }),
        ...(maxUses !== undefined && { maxUses }),
        ...(status && { status }),
      },
    });

    // Update images if provided
    if (images !== undefined) {
      // Remove existing images
      await tx.dealImage.deleteMany({
        where: { dealId: id },
      });

      // Add new images
      if (images.length > 0) {
        await tx.dealImage.createMany({
          data: images.map((url) => ({
            dealId: id,
            url,
          })),
        });
      }
    }

    return updatedDeal;
  });

  return {
    success: true,
    message: "Deal updated successfully",
    data: deal,
  };
};
