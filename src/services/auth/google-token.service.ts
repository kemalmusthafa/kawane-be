import prisma from "../../prisma";
import { sign } from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { appConfig } from "../../utils/config";

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI || "http://localhost:3000/home/" // Dynamic Redirect URI
);

type GoogleTokenInput = {
  code: string;
};

export const googleTokenService = async (input: GoogleTokenInput) => {
  const { code } = input;

  console.log("Google Token Service - Input:", {
    code: code.substring(0, 20) + "...",
  });
  console.log(
    "Google Token Service - Client ID:",
    process.env.GOOGLE_CLIENT_ID
  );
  console.log(
    "Google Token Service - Client Secret:",
    process.env.GOOGLE_CLIENT_SECRET ? "SET" : "NOT SET"
  );
  console.log("Google Token Service - Redirect URI:", process.env.REDIRECT_URI);

  try {
    // Exchange authorization code for tokens
    console.log("Exchanging authorization code for tokens...");
    console.log("Code length:", code.length);
    console.log("Client config:", {
      clientId: process.env.GOOGLE_CLIENT_ID ? "SET" : "NOT SET",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ? "SET" : "NOT SET",
      redirectUri: process.env.REDIRECT_URI || "NOT SET",
    });

    const { tokens } = await client.getToken(code);
    console.log("Tokens received:", {
      access_token: tokens.access_token ? "SET" : "NOT SET",
      id_token: tokens.id_token ? "SET" : "NOT SET",
    });
    client.setCredentials(tokens);

    // Verify the ID token
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error("Invalid Google token");
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      // Create new user with Google avatar
      user = await prisma.user.create({
        data: {
          email: payload.email,
          name: payload.name || "",
          avatar: payload.picture,
          isVerified: true,
          isDeleted: false,
          role: "CUSTOMER",
        },
      });
    } else {
      // Update existing user with latest Google avatar and name
      user = await prisma.user.update({
        where: { email: payload.email },
        data: {
          name: payload.name || user.name,
          avatar: payload.picture, // Always update with latest Google avatar
          isVerified: true, // Ensure user is verified after Google login
        },
      });
    }

    // Generate JWT token
    const appToken = sign(
      { id: user.id, role: user.role },
      appConfig.JWT_SECRET as string,
      { expiresIn: "120m" }
    );

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
  } catch (error) {
    console.error("Google Token Service Error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    throw new Error("Google authentication failed");
  }
};
