import prisma from "../../prisma";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import { appConfig } from "../../utils/config";

// Type untuk input yang sudah di-validate oleh middleware
type LoginInput = {
  email: string;
  password: string;
};

export const loginService = async (input: LoginInput) => {
  const { email, password } = input;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Incorrect email or password!");

  if (user.isDeleted) {
    throw new Error("This account has been deleted. Please contact support");
  }

  // 🚨 Handle OAuth-only users
  if (!user.password) {
    throw new Error(
      "This account was created using Google. Please login via Google!"
    );
  }

  // 🚨 Prevent login with wrong method
  if (user.avatar && user.avatar.includes("googleusercontent.com")) {
    throw new Error("Please login using your Google account!");
  }

  // ✅ Password check
  const isPasswordValid = await compare(password, user.password);
  if (!isPasswordValid) throw new Error("Incorrect email or password!");

  // Generate JWT - Fix type issue dengan type assertion
  const payload = { id: user.id, role: user.role };
  const token = sign(payload, appConfig.JWT_SECRET as string, {
    expiresIn: "120m", // Use hardcoded value temporarily
  });

  return {
    message: "Login successfully",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      avatar: user.avatar,
    },
  };
};
