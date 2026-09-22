import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "@/components/admin/admin.module.css";
import { requireAdmin } from "@/lib/admin/auth";
import { getCollectionForm } from "@/lib/admin/catalogue";
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/admin/uploads";
import { CollectionForm } from "../CollectionForm";

export const metadata: Metadata = { title: "New collection" };

export default async function NewCollectionPage() {
  await requireAdmin();
  const collection = await getCollectionForm(null);
  if (!collection) {
    notFound();
  }
  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderText}>
          <Link href="/admin/collections" className={styles.backLink}>
            Back to collections
          </Link>
          <h1 className={styles.pageTitle}>New collection</h1>
          <p className={styles.pageIntro}>
            New collections start as Draft and stay off the site until you publish them.
          </p>
        </div>
      </div>
      <CollectionForm
        collection={collection}
        acceptTypes={ACCEPTED_IMAGE_TYPES}
        maxUploadBytes={MAX_UPLOAD_BYTES}
        maxUploadLabel={MAX_UPLOAD_LABEL}
      />
    </>
  );
}
