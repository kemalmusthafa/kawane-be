import prisma from "../../prisma";

interface DeleteDealParams {
  id: string;
}

export const deleteDealService = async (params: DeleteDealParams) => {
  const { id } = params;

  // Check if deal exists
  const existingDeal = await prisma.deal.findUnique({
    where: { id },
  });

  if (!existingDeal) {
    throw new Error("Deal not found");
  }

  // Delete deal (cascade will handle DealProduct deletion)
  await prisma.deal.delete({
    where: { id },
  });

  return {
    success: true,
    message: "Deal deleted successfully",
  };
};
