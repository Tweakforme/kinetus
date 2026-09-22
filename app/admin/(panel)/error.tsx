"use client";

import Link from "next/link";
import { useEffect } from "react";
import styles from "@/components/admin/admin.module.css";

/**
 * Anything unexpected while loading or saving an admin page (a dropped database
 * connection, a request the server refused). Rendered inside the admin bar.
 */
export default function AdminError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className={`${styles.notice} ${styles.noticeError}`}>
      <p className={styles.noticeTitle}>
        Something went wrong, so the last change may not have been saved.
      </p>
      <p>
        Try again. If it keeps happening, reload the page and check the product or setting before
        editing it again.
      </p>
      <p>
        <button
          type="button"
          className={`${styles.button} ${styles.primary}`}
          onClick={() => retry()}
        >
          Try again
        </button>{" "}
        <Link href="/admin/products" className={styles.textButton}>
          Back to products
        </Link>
      </p>
    </div>
  );
}
