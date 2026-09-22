import { ArrowRightIcon, DocumentIcon } from "@/components/icons/LineIcons";
import buttons from "@/components/ui/buttons.module.css";
import type { DocumentRow } from "@/lib/products";
import styles from "./DocumentationList.module.css";

type DocumentationListProps = {
  documents: DocumentRow[];
};

/**
 * Documentation rows: document icon, title with a file-type badge, batch and variant
 * scope, and a "Download" link. Callers hide the whole section when there are no
 * documents; an empty list renders nothing.
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
            <DocumentIcon size={28} className={styles.docIcon} />
            <div className={styles.info}>
              <div className={styles.titleRow}>
                <span className={styles.title}>{doc.title}</span>
                <span className={`type-label ${styles.badge}`}>{doc.badge}</span>
              </div>
              {meta.length > 0 && (
                <p className={styles.meta}>
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
              className={`${buttons.link} ${buttons.linkTeal} ${styles.download}`}
              aria-label={`Download ${doc.title}`}
              download
            >
              Download
              <ArrowRightIcon size={18} />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
