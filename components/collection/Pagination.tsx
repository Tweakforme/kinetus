import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons/LineIcons";
import styles from "./Pagination.module.css";

type PaginationProps = {
  current: number;
  total: number;
  /** Builds the href for a page number (1 is the base listing). */
  hrefFor: (page: number) => string;
  /** Accessible name for the navigation region. */
  label?: string;
};

/**
 * Numbered pagination, centred (deck slide 7): chevron, numbered circles with the current
 * page filled teal, chevron. Renders nothing for a single page.
 */
export function Pagination({ current, total, hrefFor, label = "Pagination" }: PaginationProps) {
  if (total <= 1) {
    return null;
  }
  const pages = Array.from({ length: total }, (_, index) => index + 1);
  const previous = current > 1 ? current - 1 : null;
  const next = current < total ? current + 1 : null;

  return (
    <nav className={styles.pagination} aria-label={label}>
      {previous ? (
        <Link href={hrefFor(previous)} className={styles.arrow} aria-label="Previous page">
          <ChevronLeftIcon size={18} />
        </Link>
      ) : (
        <span className={`${styles.arrow} ${styles.arrowDisabled}`} aria-hidden="true">
          <ChevronLeftIcon size={18} />
        </span>
      )}

      <ul className={styles.list}>
        {pages.map((page) => (
          <li key={page}>
            {page === current ? (
              <span className={`numeric ${styles.page} ${styles.pageCurrent}`} aria-current="page">
                {page}
              </span>
            ) : (
              <Link href={hrefFor(page)} className={`numeric ${styles.page}`}>
                <span className="visually-hidden">Page </span>
                {page}
              </Link>
            )}
          </li>
        ))}
      </ul>

      {next ? (
        <Link href={hrefFor(next)} className={styles.arrow} aria-label="Next page">
          <ChevronRightIcon size={18} />
        </Link>
      ) : (
        <span className={`${styles.arrow} ${styles.arrowDisabled}`} aria-hidden="true">
          <ChevronRightIcon size={18} />
        </span>
      )}
    </nav>
  );
}
