import Link from "next/link";
import styles from "@/components/admin/admin.module.css";

/** A message id with no message (rendered within the admin bar). */
export default function MessageNotFound() {
  return (
    <>
      <h1 className={styles.pageTitle}>Message not found</h1>
      <p className={styles.pageIntro}>
        No message has that reference. It may have been removed, or the address may be mistyped.
      </p>
      <p>
        <Link href="/admin/messages" className={styles.backLink}>
          Back to messages
        </Link>
      </p>
    </>
  );
}
