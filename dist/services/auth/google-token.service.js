"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleTokenService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const jsonwebtoken_1 = require("jsonwebtoken");
const google_auth_library_1 = require("google-auth-library");
const config_1 = require("../../utils/config");
// Validate environment variables before creating client
if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID environment variable is not set");
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("GOOGLE_CLIENT_SECRET environment variable is not set");
}
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.REDIRECT_URI || "http://localhost:3000" // Default untuk development
);
const googleTokenService = async (input) => {
    const { code } = input;
    try {
        // Exchange authorization code for tokens
        const { tokens } = await client.getToken(code);
        if (!tokens.id_token) {
            throw new Error("No ID token received from Google");
        }
        client.setCredentials(tokens);
        // Verify the ID token
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            throw new Error("Invalid Google token");
        }
        // Find or create user
        let user = await prisma_1.default.user.findUnique({
            where: { email: payload.email },
        });
        if (!user) {
            // Create new user with Google avatar
            user = await prisma_1.default.user.create({
                data: {
                    email: payload.email,
                    name: payload.name || "",
                    avatar: payload.picture,
                    isVerified: true,
                    isDeleted: false,
                    role: "CUSTOMER",
                },
            });
        }
        else {
            // Update existing user with latest Google avatar and name
            user = await prisma_1.default.user.update({
                where: { email: payload.email },
                data: {
                    name: payload.name || user.name,
                    avatar: payload.picture, // Always update with latest Google avatar
                    isVerified: true, // Ensure user is verified after Google login
                },
            });
        }
        // Generate JWT token
        const appToken = (0, jsonwebtoken_1.sign)({ id: user.id, role: user.role }, config_1.appConfig.JWT_SECRET, { expiresIn: "120m" });
        return {
            message: "Login with Google successful",
            token: appToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                avatar: user.avatar,
            },
        };
    }
    catch (error) {
        console.error("Google Token Service Error:", error);
        console.error("Error details:", {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            name: error instanceof Error ? error.name : undefined,
        });
        // More specific error messages
        if (error instanceof Error) {
            if (error.message.includes("invalid_grant")) {
                throw new Error("Authorization code expired or invalid");
            }
            else if (error.message.includes("redirect_uri_mismatch")) {
                throw new Error("Redirect URI mismatch - check Google Console configuration");
            }
            else if (error.message.includes("invalid_client")) {
                throw new Error("Invalid client credentials - check environment variables");
            }
        }
        throw new Error("Google authentication failed");
    }
};
exports.googleTokenService = googleTokenService;
