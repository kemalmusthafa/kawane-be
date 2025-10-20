import prisma from "../../prisma";
import { hash } from "bcrypt";

// Type untuk input yang sudah di-validate oleh middleware
type CreateStaffInput = {
  name: string;
  email: string;
  password: string;
};

export const createStaffService = async (input: CreateStaffInput) => {
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

  // Create staff user
  const newStaff = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: "STAFF",
      isVerified: true,
      isDeleted: false,
    },
  });

  return {
    message: "Staff created successfully",
    staff: {
      id: newStaff.id,
      name: newStaff.name,
      email: newStaff.email,
      role: newStaff.role,
      isVerified: newStaff.isVerified,
    },
  };
};
