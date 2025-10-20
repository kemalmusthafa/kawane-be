// services/auth/verif-email.service.ts
import prisma from "../../prisma";
import { verify } from "jsonwebtoken";
import { appConfig } from "../../utils/config";

export const verifyEmailService = async (token: string) => {
  try {
    console.log("🔍 Verifying token:", token);
    console.log("🔑 JWT Secret:", appConfig.JWT_SECRET);

    // Fix type issue dengan type assertion
    const decoded: any = verify(token, appConfig.JWT_SECRET as string);
    console.log("✅ Token decoded:", decoded);

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    console.log("👤 User found:", user);

    if (!user) throw new Error("Invalid verification token");

    if (user.isVerified) {
      console.log("⚠️ User already verified");
      return { message: "Email already verified" };
    }

    await prisma.user.update({
      where: { id: decoded.id },
      data: { isVerified: true },
    });

    console.log("✅ Email verified successfully");
    return { message: "Email verified successfully" };
  } catch (error) {
    console.error("❌ Verification error:", error);
    throw new Error("Invalid or expired token");
  }
};
