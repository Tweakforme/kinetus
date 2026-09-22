import Link from "next/link";
import styles from "@/components/admin/admin.module.css";

/** A missing product or collection id inside the admin (rendered within the admin bar). */
export default function AdminNotFound() {
  return (
    <>
      <h1 className={styles.pageTitle}>Not found</h1>
      <p className={styles.pageIntro}>
        That record does not exist. It may have been deleted, or the address may be mistyped.
      </p>
      <p>
        <Link href="/admin/products" className={styles.backLink}>
          Back to products
        </Link>
      </p>
    </>
  );
}
