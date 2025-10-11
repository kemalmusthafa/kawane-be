import prisma from "../../prisma";

// Type untuk input yang sudah di-validate oleh Zod middleware
type EditUserInput = {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role?: "CUSTOMER" | "STAFF" | "ADMIN";
  isVerified?: boolean;
};

export const editUserService = async (id: string, input: EditUserInput) => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.isDeleted) {
    throw new Error("Cannot edit deleted user");
  }

  // Check if email is being changed and if it's already taken
  if (input.email && input.email !== user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existingUser) {
      throw new Error("Email already taken");
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: input,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      role: true,
      isVerified: true,
      isDeleted: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};
