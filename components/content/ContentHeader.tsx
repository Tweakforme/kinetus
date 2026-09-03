import type { ReactNode } from "react";
import { Container } from "@/components/layout/Container";
import { DiamondRule } from "@/components/marks/DiamondRule";
import { ProductBreadcrumb } from "@/components/product/ProductBreadcrumb";
import styles from "./ContentHeader.module.css";

type ContentHeaderProps = {
  /** Mono eyebrow above the title, e.g. the document's "Kinetus BioLabs" kicker. */
  kicker?: string | null;
  title: string;
  /** Body L lede under the title. */
  lede?: ReactNode;
  /** Mono metadata row, e.g. "Effective Date" / "August 12, 2026". */
  meta?: { label: string; value: string } | null;
  /** Shorter crumb when the document title is long (defaults to the title). */
  breadcrumbLabel?: string;
};

/**
 * Shared head for the content pages: breadcrumb, mono kicker, H1, optional lede and
 * mono metadata, then the diamond rule.
 */
export function ContentHeader({ kicker, title, lede, meta, breadcrumbLabel }: ContentHeaderProps) {
  return (
    <Container className={styles.header} data-reveal="">
      <ProductBreadcrumb productName={breadcrumbLabel ?? title} parent={null} />

      <div className={styles.titleBlock}>
        {kicker && <p className={`type-label ${styles.kicker}`}>{kicker}</p>}
        <h1 className={`type-h1 ${styles.title}`}>{title}</h1>
        {lede && <p className={styles.lede}>{lede}</p>}
        {meta && (
          <p className={`type-label ${styles.meta}`}>
            <span className={styles.metaLabel}>{meta.label}</span>
            <span className={`numeric ${styles.metaValue}`}>{meta.value}</span>
          </p>
        )}
      </div>

      <DiamondRule />
    </Container>
  );
}
