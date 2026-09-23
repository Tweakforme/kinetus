import { PrismaClient } from "@prisma/client";
import { CATEGORIES, seedCategories } from "./categories.ts";

/**
 * `npm run seed:categories`: adds the six Shop by Category collections and their product
 * links to the database in DATABASE_URL, additively (see prisma/categories.ts). Meant to
 * be run once on an existing database: a category the client later deletes, or moves to
 * another slug, would be created again by a second run. Prints the
 * row counts before and after so a run against the live database can be checked.
 */
const prisma = new PrismaClient();

async function counts() {
  const [products, collections, categories, links, categoryLinks, rangeLinks] = await Promise.all([
    prisma.product.count(),
    prisma.collection.count(),
    prisma.collection.count({ where: { kind: "CATEGORY" } }),
    prisma.productCollection.count(),
    prisma.productCollection.count({ where: { collection: { kind: "CATEGORY" } } }),
    prisma.productCollection.count({ where: { collection: { kind: "RANGE" } } }),
  ]);
  return { products, collections, categories, links, categoryLinks, rangeLinks };
}

/** Which schema this run writes to, without printing credentials. */
function target(): string {
  try {
    const url = new URL(process.env.DATABASE_URL ?? "");
    return `${url.hostname}, schema ${url.searchParams.get("schema") ?? "public"}`;
  } catch {
    return "unknown";
  }
}

async function main() {
  console.log("Target:", target());
  const before = await counts();
  console.log("Before:", JSON.stringify(before));
  const result = await seedCategories(prisma);
  const after = await counts();
  console.log("After: ", JSON.stringify(after));
  console.log("Result:", JSON.stringify(result));

  const rows = await prisma.collection.findMany({
    where: { slug: { in: CATEGORIES.map((category) => category.slug) } },
    select: { name: true, status: true, iconUrl: true, _count: { select: { products: true } } },
    orderBy: { displayOrder: "asc" },
  });
  for (const row of rows) {
    console.log(`  ${row.name}: ${row._count.products} products, ${row.status}, ${row.iconUrl}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
