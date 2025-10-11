import prisma from "../../prisma";

export const deleteCategoryService = async (categoryId: string) => {
  const existingCategory = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  if (!existingCategory) {
    throw new Error("Category not found");
  }

  // Check if category has products
  if (existingCategory._count.products > 0) {
    throw new Error(
      "Cannot delete category that has products. Please move or delete the products first."
    );
  }

  await prisma.category.delete({
    where: { id: categoryId },
  });

  return { message: "Category deleted successfully" };
};
