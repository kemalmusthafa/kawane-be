"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("../prisma/generated/client");
const globalForPrisma = globalThis;
// ✅ OPTIMIZED: Enhanced Prisma configuration for better performance
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
            timeout: 60000, // ✅ Increased to 60 seconds
            isolationLevel: "ReadCommitted",
            maxWait: 10000, // ✅ Max wait time for transaction
        },
    });
if (process.env.NODE_ENV !== "production")
    globalForPrisma.prisma = exports.prisma;
exports.default = exports.prisma;
