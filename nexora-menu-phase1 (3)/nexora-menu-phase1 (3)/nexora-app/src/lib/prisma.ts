import { PrismaClient } from "@prisma/client";

// Next.js hot-reloads modules in dev, which would otherwise spin up a
// fresh PrismaClient (and a fresh connection pool) on every file save.
// Caching the instance on `globalThis` keeps a single client alive.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
