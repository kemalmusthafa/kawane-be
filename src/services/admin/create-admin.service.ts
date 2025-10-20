import prisma from "../../prisma";
import { hash } from "bcrypt";

// Type untuk input yang sudah di-validate oleh middleware
type CreateAdminInput = {
  name: string;
  email: string;
  password: string;
};

export const createAdminService = async (input: CreateAdminInput) => {
  const { name, email, password } = input;

  // Check existing user
  const existUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existUser) {
    if (existUser.isDeleted) {
      throw new Error("This email has been removed, please contact support");
    }
    throw new Error("Email already exists!");
  }

  // Hash password
  const hashedPassword = await hash(password, 10);

  // Create admin user
  const newAdmin = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: "ADMIN",
      isVerified: true,
      isDeleted: false,
    },
  });

  return {
    message: "Admin created successfully",
    admin: {
      id: newAdmin.id,
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role,
      isVerified: newAdmin.isVerified,
    },
  };
};
