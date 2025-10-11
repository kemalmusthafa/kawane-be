import prisma from "../../prisma";
import { genSalt, hash, compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import { appConfig } from "../../utils/config";
import { transporter } from "../shared/mailer";
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";

// Type untuk update profile
type UpdateProfileData = {
  name?: string;
  email?: string;
  phone?: string;
};

// Type untuk change password
type ChangePasswordData = {
  currentPassword: string;
  newPassword: string;
};

export class ProfileService {
  // Get user profile
  static async getUserProfile(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          isVerified: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    } catch (error) {
      throw new Error("Failed to get user profile");
    }
  }

  // Update user profile
  static async updateProfile(userId: string, data: UpdateProfileData) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Check if email is being changed
      if (data.email && data.email !== user.email) {
        // Check if new email already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: data.email },
        });

        if (existingUser) {
          throw new Error("Email already exists");
        }

        // Generate verification token for new email
        const payload = {
          id: userId,
          newEmail: data.email,
          type: "email_change",
        };
        const token = sign(payload, appConfig.JWT_SECRET as string, {
          expiresIn: "60m",
        });

        // Send verification email
        await this.sendEmailVerificationEmail(data.email, token, user.name);

        // Update user with new email but mark as unverified
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            ...data,
            isVerified: false, // Mark as unverified when email changes
          },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            isVerified: true,
            role: true,
            updatedAt: true,
          },
        });

        return {
          ...updatedUser,
          message: "Profile updated. Please verify your new email address.",
        };
      }

      // Update without email change
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          isVerified: true,
          role: true,
          updatedAt: true,
        },
      });

      return {
        ...updatedUser,
        message: "Profile updated successfully",
      };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    }
  }

  // Change password
  static async changePassword(userId: string, data: ChangePasswordData) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (!user.password) {
        throw new Error("Password not set for this account");
      }

      // Verify current password
      const isCurrentPasswordValid = await compare(
        data.currentPassword,
        user.password
      );
      if (!isCurrentPasswordValid) {
        throw new Error("Current password is incorrect");
      }

      // Hash new password
      const salt = await genSalt(10);
      const hashedNewPassword = await hash(data.newPassword, salt);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });

      return { message: "Password changed successfully" };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to change password"
      );
    }
  }

  // Upload avatar
  static async updateAvatar(userId: string, avatarUrl: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { avatar: avatarUrl },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          isVerified: true,
          role: true,
          updatedAt: true,
        },
      });

      return {
        ...updatedUser,
        message: "Avatar updated successfully",
      };
    } catch (error) {
      throw new Error("Failed to update avatar");
    }
  }

  // Send email verification for email change
  private static async sendEmailVerificationEmail(
    email: string,
    token: string,
    userName: string
  ) {
    try {
      const verificationLink = `${process.env.BASE_URL_FE}/verify-email-change/${token}`;

      const templatePath = path.resolve(
        __dirname,
        "../../templates",
        "verif-email.hbs"
      );
      const templateSource = fs.readFileSync(templatePath, "utf-8");
      const compiledTemplate = Handlebars.compile(templateSource);
      const emailHtml = compiledTemplate({
        email,
        verificationLink,
        userName,
      });

      await transporter.sendMail({
        from: "Admin <no-reply@kawane.com>",
        to: email,
        subject: "Verify your new email address - Kawane Studio",
        html: emailHtml,
      });
    } catch (error) {
      console.error("Failed to send verification email:", error);
      throw new Error("Failed to send verification email");
    }
  }
}
