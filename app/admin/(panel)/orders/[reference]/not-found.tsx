import Link from "next/link";
import styles from "@/components/admin/admin.module.css";

/** An order reference with no order (rendered within the admin bar). */
export default function OrderNotFound() {
  return (
    <>
      <h1 className={styles.pageTitle}>Order not found</h1>
      <p className={styles.pageIntro}>
        No order has that reference. Check it against the customer&apos;s message, or search the
        orders list by name or email.
      </p>
      <p>
        <Link href="/admin/orders" className={styles.backLink}>
          Back to orders
        </Link>
      </p>
    </>
  );
}
