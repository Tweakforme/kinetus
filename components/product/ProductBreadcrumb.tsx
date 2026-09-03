import Link from "next/link";
import styles from "./ProductBreadcrumb.module.css";

type ProductBreadcrumbProps = {
  productName: string;
};

/** Home › Products › [name] — Figma 26:4 (desktop) / 68:164 (mobile). */
export function ProductBreadcrumb({ productName }: ProductBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
      <ol className={styles.list}>
        <li className={styles.item}>
          <Link href="/" className={styles.link}>
            Home
          </Link>
        </li>
        <li className={styles.item}>
          <span aria-hidden="true" className={styles.separator}>
            ›
          </span>
          <Link href="/products" className={styles.link}>
            Products
          </Link>
        </li>
        <li className={styles.item}>
          <span aria-hidden="true" className={styles.separator}>
            ›
          </span>
          <span aria-current="page" className={styles.current}>
            {productName}
          </span>
        </li>
      </ol>
    </nav>
  );
}
