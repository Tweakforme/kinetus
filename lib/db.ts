import { PrismaClient } from "@prisma/client";

/**
 * Prisma client singleton. Nothing in Phase 2 queries the database yet; this exists so
 * later phases share one client and hot-reloading in development does not exhaust
 * connections. Requires DATABASE_URL at runtime.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
