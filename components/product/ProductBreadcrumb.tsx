import Link from "next/link";
import styles from "./ProductBreadcrumb.module.css";

type ProductBreadcrumbProps = {
  /** The current page's crumb. */
  productName: string;
  /**
   * The crumb between Home and the current page. Defaults to Products; pass `null` for
   * top-level content pages (Home / Terms & Conditions).
   */
  parent?: { label: string; href: string } | null;
};

const PRODUCTS_CRUMB = { label: "Products", href: "/products" };

/** Home / Products / [name] in small uppercase Inter, secondary colour. */
export function ProductBreadcrumb({
  productName,
  parent = PRODUCTS_CRUMB,
}: ProductBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
      <ol className={styles.list}>
        <li className={styles.item}>
          <Link href="/" className={styles.link}>
            Home
          </Link>
        </li>
        {parent && (
          <li className={styles.item}>
            <span aria-hidden="true" className={styles.separator}>
              ›
            </span>
            <Link href={parent.href} className={styles.link}>
              {parent.label}
            </Link>
          </li>
        )}
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
