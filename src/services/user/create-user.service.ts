import prisma from "../../prisma";
import { genSalt, hash } from "bcrypt";

// Type untuk input yang sudah di-validate oleh Zod middleware
type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role?: "CUSTOMER" | "STAFF" | "ADMIN";
};

export const createUserService = async (input: CreateUserInput) => {
  const { name, email, password, role = "CUSTOMER" } = input;

  // Check existing user
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("Email already registered");
  }

  // Hash password
  const salt = await genSalt(10);
  const hashedPassword = await hash(password, salt);

  // Create user
  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      isVerified: false,
      isDeleted: false,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return newUser;
};
