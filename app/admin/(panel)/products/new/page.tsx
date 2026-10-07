import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/components/admin/admin.module.css";
import { requireAdmin } from "@/lib/admin/auth";
import { EMPTY_PRODUCT, getCollectionOptions } from "@/lib/admin/catalogue";
import { ProductForm } from "../ProductForm";

export const metadata: Metadata = { title: "New product" };

/**
 * /admin/products/new: starts as Draft. Images and the information sheet are stored
 * against the product, so they are added once it exists: Create product saves it and opens
 * its page with the image upload first (see ../[id]/page.tsx).
 */
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
            Fill in at least the name, one size with its price, and a range. The product stays off
            the site until you set its status to Published. Create product saves it and opens its
            image upload straight away.
          </p>
        </div>
      </div>
      <ProductForm product={EMPTY_PRODUCT} collections={collections} />
    </>
  );
}
