import Link from "next/link";
import type { ReactNode } from "react";
import { HexMesh } from "@/components/decor/HexMesh";
import { Container } from "@/components/layout/Container";
import styles from "./ContentHeader.module.css";

type ContentHeaderProps = {
  /** Cyan letterspaced line above the title: the document's kicker or the page's parent. */
  eyebrow?: string | null;
  title: string;
  /** White lede under the title. */
  lede?: ReactNode;
  /** Small metadata line, e.g. "Effective Date" / "August 12, 2026". */
  meta?: { label: string; value: string } | null;
  /** Shorter crumb when the document title is long (defaults to the title). */
  breadcrumbLabel?: string;
  /** Hide the breadcrumb (the 404 page has no place in the site tree). */
  breadcrumb?: boolean;
  /** Status variant: a huge code above the title (the 404 page). */
  statusCode?: string;
  /** Buttons under the lede. */
  actions?: ReactNode;
  /** Id for the h1 so a page can reference it with aria-labelledby. */
  headingId?: string;
};

/**
 * Shared head for the content pages: a slim navy band in the hero's language (deck slides
 * 4 and 12) without a product render. Faint hexagonal mesh upper right, breadcrumb in
 * white at 70%, cyan eyebrow, condensed mixed-case white title, optional white lede and
 * metadata line. The status variant (404) sets a huge code above a smaller title.
 */
export function ContentHeader({
  eyebrow,
  title,
  lede,
  meta,
  breadcrumbLabel,
  breadcrumb = true,
  statusCode,
  actions,
  headingId,
}: ContentHeaderProps) {
  const bandClass = statusCode ? `${styles.band} ${styles.status}` : styles.band;
  const titleClass = statusCode ? `type-h2 ${styles.title}` : `type-hero-mixed ${styles.title}`;

  return (
    <header className={bandClass}>
      <div className={styles.backdrop} aria-hidden="true">
        <HexMesh className={styles.mesh} cell={30} />
      </div>

      <Container className={styles.inner}>
        {breadcrumb && (
          <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
            <ol className={styles.crumbs}>
              <li className={styles.crumb}>
                <Link href="/" className={styles.crumbLink}>
                  Home
                </Link>
              </li>
              <li className={styles.crumb}>
                <span aria-hidden="true" className={styles.separator}>
                  ›
                </span>
                <span aria-current="page" className={styles.crumbCurrent}>
                  {breadcrumbLabel ?? title}
                </span>
              </li>
            </ol>
          </nav>
        )}

        <div className={styles.titleBlock}>
          {eyebrow && <p className={`type-eyebrow ${styles.eyebrow}`}>{eyebrow}</p>}
          {statusCode && (
            <p className={`type-hero numeric ${styles.code}`} aria-hidden="true">
              {statusCode}
            </p>
          )}
          <h1 id={headingId} className={titleClass}>
            {title}
          </h1>
          {lede && <p className={styles.lede}>{lede}</p>}
          {meta && (
            <p className={`type-label ${styles.meta}`}>
              <span className={styles.metaLabel}>{meta.label}</span>
              <span className={`numeric ${styles.metaValue}`}>{meta.value}</span>
            </p>
          )}
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      </Container>
    </header>
  );
}
