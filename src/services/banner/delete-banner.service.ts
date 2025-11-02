import prisma from "../../prisma";

export const deleteBannerService = async (bannerId: string) => {
  // Check if banner exists
  const existingBanner = await prisma.banner.findUnique({
    where: { id: bannerId },
  });

  if (!existingBanner) {
    throw new Error("Banner not found");
  }

  await prisma.banner.delete({
    where: { id: bannerId },
  });

  return { success: true };
};

