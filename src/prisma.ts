import { PrismaClient } from "../prisma/generated/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// ✅ OPTIMIZED: Enhanced Prisma configuration for better performance
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    transactionOptions: {
      timeout: 60000, // ✅ Increased to 60 seconds
      isolationLevel: "ReadCommitted",
      maxWait: 10000, // ✅ Max wait time for transaction
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
