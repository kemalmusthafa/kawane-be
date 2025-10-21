import { PrismaClient } from "../prisma/generated/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// ✅ OPTIMIZED: Enhanced Prisma configuration for better performance and connection handling
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
      timeout: 30000, // ✅ Reduced to 30 seconds for better timeout handling
      isolationLevel: "ReadCommitted",
      maxWait: 5000, // ✅ Reduced max wait time
    },
  });

// ✅ Add connection health check
if (process.env.NODE_ENV === "production") {
  // Graceful shutdown handling
  process.on("beforeExit", async () => {
    await prisma.$disconnect();
  });

  process.on("SIGINT", async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
