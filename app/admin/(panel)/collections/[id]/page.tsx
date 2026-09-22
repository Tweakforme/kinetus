import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/admin/Badges";
import styles from "@/components/admin/admin.module.css";
import { requireAdmin } from "@/lib/admin/auth";
import { getCollectionForm } from "@/lib/admin/catalogue";
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/admin/uploads";
import { COLLECTION_SLUGS } from "@/lib/site";
import { CollectionForm, DeleteCollectionForm } from "../CollectionForm";

export async function generateMetadata({
  params,
}: PageProps<"/admin/collections/[id]">): Promise<Metadata> {
  const collection = await getCollectionForm((await params).id);
  return { title: collection ? `Edit ${collection.name}` : "Collection not found" };
}

/** Slugs the static site menu links to (lib/site.ts). */
const MENU_SLUGS = new Set<string>(Object.values(COLLECTION_SLUGS));

export default async function EditCollectionPage({
  params,
  searchParams,
}: PageProps<"/admin/collections/[id]">) {
  await requireAdmin();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const collection = await getCollectionForm(id);
  if (!collection || collection.id === null) {
    notFound();
  }

  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderText}>
          <Link href="/admin/collections" className={styles.backLink}>
            Back to collections
          </Link>
          <h1 className={styles.pageTitle}>{collection.name}</h1>
          <p className={styles.pageIntro}>
            <StatusBadge status={collection.status} />{" "}
            <span className={styles.mono}>/collections/{collection.slug}</span>
          </p>
        </div>
        {collection.status === "PUBLISHED" && (
          <div className={styles.headerActions}>
            <a
              href={`/collections/${collection.slug}`}
              className={`${styles.button} ${styles.secondary}`}
              target="_blank"
              rel="noopener"
            >
              View on site<span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          </div>
        )}
      </div>

      {query.created === "1" && (
        <div role="status" className={`${styles.notice} ${styles.noticeSuccess}`}>
          <p>Collection created. Publish it when it is ready.</p>
        </div>
      )}

      <CollectionForm
        collection={collection}
        acceptTypes={ACCEPTED_IMAGE_TYPES}
        maxUploadBytes={MAX_UPLOAD_BYTES}
        maxUploadLabel={MAX_UPLOAD_LABEL}
      />
      <DeleteCollectionForm
        collectionId={collection.id}
        name={collection.name}
        linkedFromMenu={collection.kind === "RANGE" && MENU_SLUGS.has(collection.slug)}
      />
    </>
  );
}
