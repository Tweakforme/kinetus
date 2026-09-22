import { CollectionKind, Prisma, ProductStatus, VariantStatus } from "@prisma/client";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { StatusBadge } from "@/components/admin/Badges";
import styles from "@/components/admin/admin.module.css";
import { requireAdmin } from "@/lib/admin/auth";
import { formatStoreDate } from "@/lib/admin/forms";
import { prisma } from "@/lib/db";
import { imagesForVariant } from "@/lib/product-images";
import { formatCad } from "@/lib/products";

export const metadata: Metadata = { title: "Products" };

const SORTS = {
  "name-asc": { label: "Name, A to Z", orderBy: [{ name: "asc" }] },
  "name-desc": { label: "Name, Z to A", orderBy: [{ name: "desc" }] },
  "updated-desc": { label: "Recently updated first", orderBy: [{ updatedAt: "desc" }] },
  "updated-asc": { label: "Least recently updated first", orderBy: [{ updatedAt: "asc" }] },
} satisfies Record<string, { label: string; orderBy: Prisma.ProductOrderByWithRelationInput[] }>;

type SortKey = keyof typeof SORTS;

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

/** /admin/products: every product, searchable by name, filterable, sortable. */
export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  await requireAdmin();
  const params = await searchParams;
  const query = first(params.q).slice(0, 80);
  const statusParam = first(params.status);
  const status = (Object.values(ProductStatus) as string[]).includes(statusParam)
    ? (statusParam as ProductStatus)
    : null;
  const collectionParam = first(params.collection);
  const sortParam = first(params.sort);
  const sort: SortKey = sortParam in SORTS ? (sortParam as SortKey) : "name-asc";

  const collections = await prisma.collection.findMany({
    select: { id: true, name: true, kind: true },
    orderBy: [{ kind: "asc" }, { displayOrder: "asc" }, { name: "asc" }],
  });
  const collectionId = collections.some((collection) => collection.id === collectionParam)
    ? collectionParam
    : null;

  const products = await prisma.product.findMany({
    where: {
      ...(query ? { name: { contains: query, mode: "insensitive" } } : {}),
      ...(status ? { status } : {}),
      ...(collectionId ? { collections: { some: { collectionId } } } : {}),
    },
    orderBy: SORTS[sort].orderBy,
    include: {
      variants: {
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
        select: { id: true, price: true, status: true },
      },
      images: {
        orderBy: [{ isPrimary: "desc" }, { displayOrder: "asc" }, { createdAt: "asc" }],
        select: { url: true, variantId: true },
      },
      collections: {
        select: { collection: { select: { name: true, kind: true, displayOrder: true } } },
      },
    },
  });
  const filtered = Boolean(query || status || collectionId);

  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderText}>
          <h1 className={styles.pageTitle}>Products</h1>
          <p className={styles.pageIntro}>
            Select a product to edit its details, sizes, prices and images.
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/admin/products/new" className={`${styles.button} ${styles.primary}`}>
            New product
          </Link>
        </div>
      </div>

      <form method="get" className={styles.filters} role="search" aria-label="Find products">
        <div className={styles.field}>
          <label htmlFor="filter-q" className={styles.label}>
            Search by name
          </label>
          <input
            id="filter-q"
            name="q"
            type="search"
            defaultValue={query}
            className={styles.input}
            autoComplete="off"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="filter-status" className={styles.label}>
            Status
          </label>
          <select
            id="filter-status"
            name="status"
            defaultValue={status ?? ""}
            className={styles.select}
          >
            <option value="">All</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="filter-collection" className={styles.label}>
            Collection
          </label>
          <select
            id="filter-collection"
            name="collection"
            defaultValue={collectionId ?? ""}
            className={styles.select}
          >
            <option value="">All</option>
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
                {collection.kind === CollectionKind.CATEGORY ? " (category)" : ""}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="filter-sort" className={styles.label}>
            Sort
          </label>
          <select id="filter-sort" name="sort" defaultValue={sort} className={styles.select}>
            {Object.entries(SORTS).map(([key, option]) => (
              <option key={key} value={key}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className={`${styles.button} ${styles.secondary}`}>
          Apply
        </button>
      </form>

      <p className={styles.resultCount} aria-live="polite">
        {products.length} {products.length === 1 ? "product" : "products"}
        {filtered && (
          <>
            {" "}
            match.{" "}
            <Link href="/admin/products" className={styles.textButton}>
              Clear filters
            </Link>
          </>
        )}
      </p>

      {products.length === 0 ? (
        <div className={styles.records}>
          <p className={styles.empty}>
            No products match. Try another search or clear the filters.
          </p>
        </div>
      ) : (
        <ul className={styles.records} aria-label="Products">
          <li className={styles.recordsHead} aria-hidden="true">
            <span>Image</span>
            <span>Product</span>
            <span>Status</span>
            <span>Sizes</span>
            <span>Price</span>
            <span>Collections</span>
            <span>Updated</span>
          </li>
          {products.map((product) => {
            const active = product.variants.filter(
              (variant) => variant.status === VariantStatus.ACTIVE,
            );
            const archived = product.variants.length - active.length;
            const prices = active.map((variant) => variant.price);
            const low = prices.length > 0 ? Math.min(...prices) : null;
            const high = prices.length > 0 ? Math.max(...prices) : null;
            const priceText =
              low === null
                ? "No active sizes"
                : low === high
                  ? formatCad(low)
                  : `${formatCad(low)} to ${formatCad(high!)}`;
            const thumb = imagesForVariant(product.images, active[0]?.id ?? null)[0];
            const collectionNames = [...product.collections]
              .sort(
                (a, b) =>
                  (a.collection.kind === b.collection.kind
                    ? 0
                    : a.collection.kind === "RANGE"
                      ? -1
                      : 1) || a.collection.displayOrder - b.collection.displayOrder,
              )
              .map((link) => link.collection.name);
            return (
              <li key={product.id} className={styles.record}>
                <div className={styles.recordThumb}>
                  {thumb && (
                    <Image
                      src={thumb.url}
                      alt=""
                      fill
                      sizes="64px"
                      className={styles.recordThumbImage}
                    />
                  )}
                </div>
                <div className={styles.recordCell}>
                  <Link href={`/admin/products/${product.id}`} className={styles.recordName}>
                    {product.name}
                  </Link>
                  <span className={styles.recordSlug}>/products/{product.slug}</span>
                </div>
                <div className={styles.recordMeta}>
                  <span className={styles.recordCell}>
                    <span className={styles.recordLabel}>Status: </span>
                    <StatusBadge status={product.status} />
                  </span>
                  <span className={styles.recordCell}>
                    <span className={styles.recordLabel}>Sizes: </span>
                    <span className={styles.mono}>
                      {active.length} {active.length === 1 ? "size" : "sizes"}
                      {archived > 0 ? ` (+${archived} archived)` : ""}
                    </span>
                  </span>
                  <span className={styles.recordCell}>
                    <span className={styles.recordLabel}>Price: </span>
                    <span className={styles.mono}>{priceText}</span>
                  </span>
                  <span className={styles.recordCell}>
                    <span className={styles.recordLabel}>Collections: </span>
                    {collectionNames.length > 0 ? collectionNames.join(", ") : "None"}
                  </span>
                  <span className={styles.recordCell}>
                    <span className={styles.recordLabel}>Updated: </span>
                    {formatStoreDate(product.updatedAt)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
