// services/auth/get-session.service.ts
import prisma from "../../prisma";

// Type untuk input yang sudah di-validate oleh Zod middleware
type GetSessionInput = {
  userId: string;
};

export const getSessionService = async (input: GetSessionInput) => {
  const { userId } = input;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) throw new Error("User not found");

  return user;
};
