// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// Create a global variable for Prisma Client to avoid multiple instances
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "info", "warn", "error"], // Optional: Enable logging for debugging
  });

// Prevent creating multiple instances of Prisma Client in development mode
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
