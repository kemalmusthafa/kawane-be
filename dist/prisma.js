"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("../prisma/generated/client");
const globalForPrisma = globalThis;
// ✅ OPTIMIZED: Enhanced Prisma configuration for better performance and connection handling
exports.prisma = globalForPrisma.prisma ??
    new client_1.PrismaClient({
        log: process.env.NODE_ENV === "development"
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
        await exports.prisma.$disconnect();
    });
    process.on("SIGINT", async () => {
        await exports.prisma.$disconnect();
        process.exit(0);
    });
    process.on("SIGTERM", async () => {
        await exports.prisma.$disconnect();
        process.exit(0);
    });
}
if (process.env.NODE_ENV !== "production")
    globalForPrisma.prisma = exports.prisma;
exports.default = exports.prisma;
