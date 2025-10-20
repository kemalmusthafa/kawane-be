// services/auth/reset-password.service.ts
import prisma from "../../prisma";
import { verify } from "jsonwebtoken";
import { genSalt, hash } from "bcrypt";
import { appConfig } from "../../utils/config";

// Type untuk input yang sudah di-validate oleh Zod middleware
type ResetPasswordInput = {
  token: string;
  newPassword: string;
};

export const resetPasswordService = async (input: ResetPasswordInput) => {
  const { token, newPassword } = input;

  try {
    // Fix type issue dengan type assertion
    const decoded: any = verify(token, appConfig.JWT_SECRET as string);

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) throw new Error("Invalid or expired token");

    // Hash new password
    const salt = await genSalt(10);
    const hashedPassword = await hash(newPassword, salt);

    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashedPassword },
    });

    return { message: "Password has been reset successfully" };
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};
