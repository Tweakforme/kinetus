import type { ComponentType } from "react";
import {
  ClipboardCheckIcon,
  FlaskIcon,
  HexagonIcon,
  ShieldCheckIcon,
  TagIcon,
  VialIcon,
} from "@/components/icons/LineIcons";
import styles from "./ProductFeatureRow.module.css";

type IconComponent = ComponentType<{ size?: number; className?: string }>;

type Feature = {
  Icon: IconComponent;
  /** Two-line label; uppercase is applied by CSS. */
  lines: [string, string?];
};

type ProductFeatureRowProps = {
  /** Physical form ("Lyophilized powder"); the form chip is omitted when null. */
  form: string | null;
};

/** "Lyophilized powder" reads as two lines, a single-word form as one. */
function formLines(form: string): [string, string?] {
  const trimmed = form.trim();
  const space = trimmed.indexOf(" ");
  if (space === -1) {
    return [trimmed];
  }
  return [trimmed.slice(0, space), trimmed.slice(space + 1)];
}

/* Pointy-top hexagon outline inset for a 1.5px stroke inside a 56px box. */
const HEX_POINTS = "28,1.5 50.95,14.75 50.95,41.25 28,54.5 5.05,41.25 5.05,14.75";

/**
 * The icon row of the product hero (deck slide 9): thin-line icons inside hexagon-outline
 * chips with two-line labels. The deck's benefit labels are replaced by neutral facts
 * about the unit: vial, form, batch reference, documentation and the packaging strings.
 */
export function ProductFeatureRow({ form }: ProductFeatureRowProps) {
  const features: Feature[] = [
    { Icon: VialIcon, lines: ["Sealed glass", "vial"] },
    ...(form ? [{ Icon: HexagonIcon, lines: formLines(form) }] : []),
    { Icon: TagIcon, lines: ["Batch reference", "on label"] },
    { Icon: ClipboardCheckIcon, lines: ["Batch-specific", "COA available"] },
    { Icon: ShieldCheckIcon, lines: ["Third-party", "tested"] },
    { Icon: FlaskIcon, lines: ["For research", "use only"] },
  ];

  return (
    <ul className={styles.row} aria-label="Unit facts">
      {features.map(({ Icon, lines }) => (
        <li key={lines.join(" ")} className={styles.item}>
          <span className={styles.chip}>
            <svg
              className={styles.hex}
              viewBox="0 0 56 56"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              focusable="false"
            >
              <polygon points={HEX_POINTS} stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <Icon size={40} className={styles.icon} />
          </span>
          <span className={styles.label}>
            {lines[0]}
            {lines[1] && (
              <>
                <br />
                {lines[1]}
              </>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
