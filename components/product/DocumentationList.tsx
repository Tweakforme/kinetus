import type { DocumentRow } from "@/lib/products";
import { DocumentIcon, DownloadIcon } from "./ProductIcons";
import styles from "./DocumentationList.module.css";

type DocumentationListProps = {
  documents: DocumentRow[];
};

/**
 * Documentation rows — Figma 29:10 (desktop) / 69:186 (mobile).
 * Doc icon · title + type badge · batch/lot and variant scope · download (44px target).
 * Callers hide the whole section when there are no documents.
 */
export function DocumentationList({ documents }: DocumentationListProps) {
  if (documents.length === 0) {
    return null;
  }

  return (
    <ul className={styles.list}>
      {documents.map((doc) => {
        const meta = [
          doc.batchLot ? `Batch ${doc.batchLot}` : null,
          doc.variantLabel ? `${doc.variantLabel} presentation` : null,
        ].filter((part): part is string => part !== null);

        return (
          <li key={doc.id} className={styles.row}>
            <DocumentIcon className={styles.docIcon} />
            <div className={styles.info}>
              <div className={styles.titleRow}>
                <span className={`type-body ${styles.title}`}>{doc.title}</span>
                <span className={`type-label ${styles.badge}`}>{doc.badge}</span>
              </div>
              {meta.length > 0 && (
                <p className={`type-caption ${styles.meta}`}>
                  {meta.map((part, index) => (
                    <span key={part}>
                      {index > 0 && <span className={styles.metaSeparator}>·</span>}
                      {part}
                    </span>
                  ))}
                </p>
              )}
            </div>
            <a
              href={doc.fileUrl}
              className={styles.download}
              aria-label={`Download ${doc.title}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <DownloadIcon />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
