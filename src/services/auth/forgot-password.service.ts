// services/auth/forgot-password.service.ts
import prisma from "../../prisma";
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import nodemailer from "nodemailer";
import { transporter } from "../shared/mailer";
import { sign } from "jsonwebtoken";
import { appConfig } from "../../utils/config";

// Type untuk input yang sudah di-validate oleh Zod middleware
type ForgotPasswordInput = {
  email: string;
};

export const forgotPasswordService = async (input: ForgotPasswordInput) => {
  const { email } = input;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Email not registered!");

  if (user.isDeleted) {
    throw new Error("This account has been deleted. Please contact support");
  }

  // Generate reset token
  const payload = { id: user.id };
  // Fix type issue dengan type assertion
  const token = sign(payload, appConfig.JWT_SECRET as string, {
    expiresIn: "30m",
  });
  const resetLink = `${process.env.BASE_URL_FE}/reset-password/${token}`;

  // Load email template
  const templatePath = path.resolve(
    __dirname,
    "../../templates",
    "forgotPassword.hbs"
  );

  console.log("Template path:", templatePath);

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Email template not found at: ${templatePath}`);
  }

  const templateSource = fs.readFileSync(templatePath, "utf-8");
  const compiledTemplate = Handlebars.compile(templateSource);
  const emailHtml = compiledTemplate({ email, resetLink });

  console.log("Sending reset password email to:", email);
  console.log("Reset link:", resetLink);

  try {
    // Send email
    const info = await transporter.sendMail({
      from: "Kawane Studio <no-reply@kawane.com>",
      to: email,
      subject: "Reset Your Password - Kawane Studio",
      html: emailHtml,
    });

    console.log("Email sent successfully:", info.messageId);
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info as any));

    return {
      message: "Password reset email sent successfully",
      previewUrl: nodemailer.getTestMessageUrl(info as any), // For development testing
      resetLink: resetLink, // Always include reset link for development
    };
  } catch (error) {
    console.error("Email sending failed:", error);
    // Return reset link directly for development
    return {
      message:
        "Password reset email failed, but here's your reset link for testing",
      resetLink: resetLink,
    };
  }
};
