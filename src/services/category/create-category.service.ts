import prisma from "../../prisma";

interface CreateCategoryData {
  name: string;
  description?: string;
  image?: string;
}

export const createCategoryService = async (data: CreateCategoryData) => {
  if (!data.name.trim()) {
    throw new Error("Category name is required");
  }

  // Validasi duplicate name dihapus - sekarang bisa membuat category dengan nama yang sama

  const category = await prisma.category.create({
    data: {
      name: data.name.trim(),
      description: data.description?.trim(),
      image: data.image,
    },
  });

  return category;
};
