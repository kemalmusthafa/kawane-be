import prisma from "../../prisma";
import { verify } from "jsonwebtoken";
import { appConfig } from "../../utils/config";

export const verifyEmailChangeService = async (token: string) => {
  try {
    // Verify token
    const decoded: any = verify(token, appConfig.JWT_SECRET as string);

    // Check if token is for email change
    if (decoded.type !== "email_change") {
      throw new Error("Invalid token type");
    }

    const userId = decoded.id;
    const newEmail = decoded.newEmail;

    if (!userId || !newEmail) {
      throw new Error("Invalid token payload");
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }

    // Check if new email is already taken by another user
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new Error("Email already taken by another user");
    }

    // Update user email and mark as verified
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        email: newEmail,
        isVerified: true,
      },
    });

    return {
      message: "Email address updated and verified successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        isVerified: updatedUser.isVerified,
      },
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("expired")) {
      throw new Error(
        "Verification link has expired. Please request a new one."
      );
    }
    throw new Error("Invalid or expired verification link");
  }
};
