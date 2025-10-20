import prisma from "../../prisma";

// Soft delete user
export const softDeleteUserService = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.isDeleted) {
    return { message: "User already soft-deleted" };
  }

  await prisma.user.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });

  return { message: "User soft-deleted successfully" };
};

// Hard delete user
export const hardDeleteUserService = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new Error("User not found");
  }

  await prisma.user.delete({
    where: { id },
  });

  return { message: "User hard-deleted successfully" };
};

// Restore user (opsional)
export const restoreUserService = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.isDeleted) {
    return { message: "User is already active" };
  }

  await prisma.user.update({
    where: { id },
    data: {
      isDeleted: false,
      deletedAt: null,
    },
  });

  return { message: "User restored successfully" };
};
