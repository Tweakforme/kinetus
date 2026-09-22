import { CollectionKind, ProductStatus } from "@prisma/client";
import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/admin/Badges";
import styles from "@/components/admin/admin.module.css";
import { requireAdmin } from "@/lib/admin/auth";
import { formatStoreDate } from "@/lib/admin/forms";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Collections" };

const GROUPS = [
  {
    kind: CollectionKind.RANGE,
    title: "Ranges",
    intro: "The menu tabs. A product belongs to one range.",
    empty: "No ranges yet.",
  },
  {
    kind: CollectionKind.CATEGORY,
    title: "Categories",
    intro: "Shop by Category groupings. A product can be in any number of categories.",
    empty: "No categories yet. Use New collection and choose the kind Category.",
  },
];

/** /admin/collections: ranges and categories, each with its product count. */
export default async function AdminCollectionsPage({
  searchParams,
}: PageProps<"/admin/collections">) {
  await requireAdmin();
  const { deleted } = await searchParams;
  const collections = await prisma.collection.findMany({
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { products: true } },
      products: {
        where: { product: { status: ProductStatus.PUBLISHED } },
        select: { productId: true },
      },
    },
  });

  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderText}>
          <h1 className={styles.pageTitle}>Collections</h1>
          <p className={styles.pageIntro}>Ranges and categories group products on the site.</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/admin/collections/new" className={`${styles.button} ${styles.primary}`}>
            New collection
          </Link>
        </div>
      </div>

      {typeof deleted === "string" && (
        <div role="status" className={`${styles.notice} ${styles.noticeSuccess}`}>
          <p>Deleted the collection “{deleted}”.</p>
        </div>
      )}

      {GROUPS.map((group) => {
        const rows = collections.filter((collection) => collection.kind === group.kind);
        return (
          <section
            key={group.kind}
            className={styles.panel}
            aria-labelledby={`group-${group.kind}`}
          >
            <h2 id={`group-${group.kind}`} className={styles.panelTitle}>
              {group.title}
            </h2>
            <p className={styles.panelIntro}>{group.intro}</p>
            {rows.length === 0 ? (
              <p className={styles.hint}>{group.empty}</p>
            ) : (
              <ul
                className={`${styles.records} ${styles.collectionRecords}`}
                aria-label={group.title}
              >
                <li className={styles.recordsHead} aria-hidden="true">
                  <span>Collection</span>
                  <span>Status</span>
                  <span>Products</span>
                  <span>Published</span>
                  <span>Order</span>
                  <span>Updated</span>
                </li>
                {rows.map((collection) => (
                  <li key={collection.id} className={styles.record}>
                    <div className={styles.recordCell}>
                      <Link
                        href={`/admin/collections/${collection.id}`}
                        className={styles.recordName}
                      >
                        {collection.name}
                      </Link>
                      <span className={styles.recordSlug}>/collections/{collection.slug}</span>
                    </div>
                    <div className={styles.recordMeta}>
                      <span className={styles.recordCell}>
                        <span className={styles.recordLabel}>Status: </span>
                        <StatusBadge status={collection.status} />
                      </span>
                      <span className={styles.recordCell}>
                        <span className={styles.recordLabel}>Products: </span>
                        <span className={styles.mono}>
                          {collection._count.products}{" "}
                          {collection._count.products === 1 ? "product" : "products"}
                        </span>
                      </span>
                      <span className={styles.recordCell}>
                        <span className={styles.recordLabel}>Published products: </span>
                        <span className={styles.mono}>{collection.products.length} published</span>
                      </span>
                      <span className={styles.recordCell}>
                        <span className={styles.recordLabel}>Order: </span>
                        <span className={styles.mono}>{collection.displayOrder}</span>
                      </span>
                      <span className={styles.recordCell}>
                        <span className={styles.recordLabel}>Updated: </span>
                        {formatStoreDate(collection.updatedAt)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </>
  );
}
