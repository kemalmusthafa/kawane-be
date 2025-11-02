import prisma from "../../prisma";

interface UpdateBannerData {
  text?: string;
  isActive?: boolean;
  backgroundColor?: string;
  textColor?: string;
  linkUrl?: string;
  linkText?: string;
  dealId?: string;
  priority?: number;
  duration?: number;
}

export const updateBannerService = async (
  bannerId: string,
  data: UpdateBannerData
) => {
  // Check if banner exists
  const existingBanner = await prisma.banner.findUnique({
    where: { id: bannerId },
  });

  if (!existingBanner) {
    throw new Error("Banner not found");
  }

  // Validate priority range if provided
  if (data.priority !== undefined && (data.priority < 1 || data.priority > 10)) {
    throw new Error("Priority must be between 1 and 10");
  }

  // Validate dealId if provided
  if (data.dealId) {
    const deal = await prisma.deal.findUnique({
      where: { id: data.dealId },
    });
    if (!deal) {
      throw new Error("Deal not found");
    }
  }

  const updateData: any = {};
  
  if (data.text !== undefined) {
    if (!data.text.trim()) {
      throw new Error("Banner text cannot be empty");
    }
    updateData.text = data.text.trim();
  }
  
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.backgroundColor !== undefined) updateData.backgroundColor = data.backgroundColor;
  if (data.textColor !== undefined) updateData.textColor = data.textColor;
  if (data.linkUrl !== undefined) updateData.linkUrl = data.linkUrl;
  if (data.linkText !== undefined) updateData.linkText = data.linkText;
  if (data.dealId !== undefined) updateData.dealId = data.dealId;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.duration !== undefined) updateData.duration = data.duration;

  const banner = await prisma.banner.update({
    where: { id: bannerId },
    data: updateData,
  });

  return banner;
};

