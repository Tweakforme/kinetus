import { Prisma, PrismaClient } from "@prisma/client";

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

/**
 * The schema Prisma's own queries use (`?schema=` on DATABASE_URL, else public). Behind the
 * connection pooler a raw statement runs with whatever search_path the pooled session has,
 * which is not guaranteed to be that schema, so raw SQL names it through `rawTable`.
 */
const SCHEMA = (() => {
  try {
    return new URL(process.env.DATABASE_URL ?? "").searchParams.get("schema") || "public";
  } catch {
    return "public";
  }
})();

/** A model's table qualified with the schema, for $queryRaw and $executeRaw. */
export function rawTable(name: Prisma.ModelName): Prisma.Sql {
  return Prisma.raw(`"${SCHEMA.replace(/"/g, '""')}"."${name}"`);
}
