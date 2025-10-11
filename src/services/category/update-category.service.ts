import prisma from "../../prisma";

interface UpdateCategoryData {
  name?: string;
  description?: string;
  image?: string;
}

export const updateCategoryService = async (
  categoryId: string,
  data: UpdateCategoryData
) => {
  const existingCategory = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!existingCategory) {
    throw new Error("Category not found");
  }

  // Validasi duplicate name dihapus - sekarang bisa update category dengan nama yang sama

  const category = await prisma.category.update({
    where: { id: categoryId },
    data: {
      ...(data.name && { name: data.name.trim() }),
      ...(data.description !== undefined && {
        description: data.description?.trim(),
      }),
      ...(data.image !== undefined && { image: data.image }),
    },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  return category;
};
