import { ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/order-status";
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

const ORDER_TONE: Record<OrderStatus, string> = {
  NEW: styles.badgeNew,
  AWAITING_PAYMENT: styles.badgeAwaiting,
  PAID: styles.badgeLive,
  SHIPPED: styles.badgeOn,
  CANCELLED: styles.badgeArchived,
};

/** An order's status. New and Awaiting payment stand out: both are waiting on the client. */
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`${styles.badge} ${ORDER_TONE[status]}`}>{ORDER_STATUS_LABEL[status]}</span>
  );
}

/** Something the client has to act on, such as a customer who was never emailed. */
export function WarningBadge({ children }: { children: string }) {
  return <span className={`${styles.badge} ${styles.badgeWarn}`}>{children}</span>;
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
