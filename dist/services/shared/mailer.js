"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
// Check if email credentials are configured
const isEmailConfigured = process.env.MAIL_USER &&
    process.env.MAIL_PASS &&
    process.env.MAIL_USER !== "your-email@gmail.com" &&
    process.env.MAIL_PASS !== "your-app-password-here";
exports.transporter = isEmailConfigured
    ? nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    })
    : nodemailer_1.default.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        auth: {
            user: "ethereal.user@ethereal.email",
            pass: "ethereal.pass",
        },
    });
