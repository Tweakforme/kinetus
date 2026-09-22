import styles from "./admin.module.css";

const TONE: Record<string, string> = {
  PUBLISHED: styles.badgeLive,
  ACTIVE: styles.badgeLive,
  DRAFT: styles.badgeDraft,
  ARCHIVED: styles.badgeArchived,
};

const WORD: Record<string, string> = {
  PUBLISHED: "Published",
  ACTIVE: "Active",
  DRAFT: "Draft",
  ARCHIVED: "Archived",
};

/** Product, variant or collection status as a small label. */
export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`${styles.badge} ${TONE[status] ?? styles.badgeDraft}`}>
      {WORD[status] ?? status}
    </span>
  );
}

/** On / Off for switches such as a discount code being live. */
export function OnOffBadge({
  on,
  onLabel = "On",
  offLabel = "Off",
}: {
  on: boolean;
  onLabel?: string;
  offLabel?: string;
}) {
  return (
    <span className={`${styles.badge} ${on ? styles.badgeOn : styles.badgeDraft}`}>
      {on ? onLabel : offLabel}
    </span>
  );
}
