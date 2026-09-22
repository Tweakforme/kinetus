import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/components/admin/admin.module.css";
import { requireAdmin } from "@/lib/admin/auth";
import { EMPTY_PRODUCT, getCollectionOptions } from "@/lib/admin/catalogue";
import { ProductForm } from "../ProductForm";

export const metadata: Metadata = { title: "New product" };

/** /admin/products/new: starts as Draft; images are added once the product exists. */
export default async function NewProductPage() {
  await requireAdmin();
  const collections = await getCollectionOptions();

  return (
    <>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderText}>
          <Link href="/admin/products" className={styles.backLink}>
            Back to products
          </Link>
          <h1 className={styles.pageTitle}>New product</h1>
          <p className={styles.pageIntro}>
            Fill in at least the name, one size with its price, and the range. The product stays off
            the site until you set its status to Published.
          </p>
        </div>
      </div>
      <ProductForm product={EMPTY_PRODUCT} collections={collections} />
    </>
  );
}
