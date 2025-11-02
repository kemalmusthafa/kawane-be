import prisma from "../../prisma";

interface CreateBannerData {
  text: string;
  isActive?: boolean;
  backgroundColor?: string;
  textColor?: string;
  linkUrl?: string;
  linkText?: string;
  dealId?: string;
  priority?: number;
  duration?: number;
}

export const createBannerService = async (data: CreateBannerData) => {
  if (!data.text.trim()) {
    throw new Error("Banner text is required");
  }

  // Validate priority range
  const priority = data.priority || 1;
  if (priority < 1 || priority > 10) {
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

  const banner = await prisma.banner.create({
    data: {
      text: data.text.trim(),
      isActive: data.isActive ?? true,
      backgroundColor: data.backgroundColor,
      textColor: data.textColor,
      linkUrl: data.linkUrl,
      linkText: data.linkText,
      dealId: data.dealId,
      priority,
      duration: data.duration,
    },
  });

  return banner;
};

