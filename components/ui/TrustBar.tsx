import type { ComponentType } from "react";
import styles from "./TrustBar.module.css";

type IconComponent = ComponentType<{ size?: number; className?: string }>;

export type TrustItem = {
  Icon: IconComponent;
  title: string;
  copy?: string;
  /** Red icon (the maple leaf). */
  accent?: "red";
};

type TrustBarProps = {
  items: TrustItem[];
  /** "row" sits flat on the page (homepage); "card" is bordered and rounded (product page). */
  variant?: "row" | "card";
  /** Accessible name for the list. */
  label: string;
  className?: string;
};

/**
 * Four- or five-across trust row with hairline vertical rules between items (deck slides
 * 4 and 9). Titles are royal blue uppercase; copy is short and structural.
 */
export function TrustBar({ items, variant = "row", label, className }: TrustBarProps) {
  const classes = [styles.bar, variant === "card" ? styles.card : "", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <ul className={classes} aria-label={label}>
      {items.map(({ Icon, title, copy, accent }) => (
        <li key={title} className={styles.item}>
          <Icon
            size={44}
            className={accent === "red" ? `${styles.icon} ${styles.iconRed}` : styles.icon}
          />
          <span className={styles.text}>
            <span className={styles.title}>{title}</span>
            {copy && <span className={styles.copy}>{copy}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}
