// services/auth/verif-email.service.ts
import prisma from "../../prisma";
import { verify } from "jsonwebtoken";
import { appConfig } from "../../utils/config";

export const verifyEmailService = async (token: string) => {
  try {
    // Fix type issue dengan type assertion
    const decoded: any = verify(token, appConfig.JWT_SECRET as string);

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) throw new Error("Invalid verification token");

    if (user.isVerified) {
      return { message: "Email already verified" };
    }

    await prisma.user.update({
      where: { id: decoded.id },
      data: { isVerified: true },
    });

    return { message: "Email verified successfully" };
  } catch (error) {
    console.error("Verification error:", error);
    throw new Error("Invalid or expired token");
  }
};
