import nodemailer from "nodemailer";

// Check if email credentials are configured
const isEmailConfigured =
  process.env.MAIL_USER &&
  process.env.MAIL_PASS &&
  process.env.MAIL_USER !== "your-email@gmail.com" &&
  process.env.MAIL_PASS !== "your-app-password-here";

export const transporter = isEmailConfigured
  ? nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    })
  : nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "ethereal.user@ethereal.email",
        pass: "ethereal.pass",
      },
    });
