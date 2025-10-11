import prisma from "../../prisma";
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import { transporter } from "../shared/mailer";
import { sign } from "jsonwebtoken";
import { genSalt, hash } from "bcrypt";
import { appConfig } from "../../utils/config";

// Type untuk input yang sudah di-validate oleh Zod middleware
type RegisterInput = {
  name: string;
  email: string;
  password?: string;
};

export const registerService = async (input: RegisterInput) => {
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

  // 🔑 Hash password jika ada
  let hashedPassword: string | null = null;
  if (password) {
    const salt = await genSalt(10);
    hashedPassword = await hash(password, salt);
  }

  // Create user
  const newUser = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      isVerified: false,
      isDeleted: false,
      role: "CUSTOMER", // Default role
    },
  });

  // ✅ Send verification email jika register dengan password
  if (password) {
    const payload = { id: newUser.id };
    // Fix type issue dengan type assertion
    const token = sign(payload, appConfig.JWT_SECRET as string, {
      expiresIn: "60m",
    });
    const verificationLink = `${process.env.BASE_URL_FE}/verify/${token}`;

    const templatePath = path.resolve(
      __dirname,
      "../../templates",
      "verif-email.hbs"
    );
    const templateSource = fs.readFileSync(templatePath, "utf-8");
    const compiledTemplate = Handlebars.compile(templateSource);
    const emailHtml = compiledTemplate({ email, verificationLink });

    await transporter.sendMail({
      from: "Admin <no-reply@kawane.com>",
      to: email,
      subject:
        "Welcome to Kawane Studio. Please verify your email to complete registration",
      html: emailHtml,
    });

    return {
      message: "Verification email sent successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        isVerified: newUser.isVerified,
      },
    };
  }

  return {
    message: "User registered via OAuth successfully",
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      isVerified: newUser.isVerified,
    },
  };
};
