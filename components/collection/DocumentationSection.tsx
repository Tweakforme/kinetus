import Link from "next/link";
import type { ComponentType } from "react";
import { ClipboardCheckIcon, EnvelopeIcon, VialIcon } from "@/components/icons/LineIcons";
import { Container } from "@/components/layout/Container";
import buttons from "@/components/ui/buttons.module.css";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { CONTACT_LINK } from "@/lib/site";
import styles from "./DocumentationSection.module.css";

type IconComponent = ComponentType<{ size?: number; className?: string }>;

/** Anchor used by the header's documentation icon and the homepage COA card. */
export const DOCUMENTATION_SECTION_ID = "documentation";

/** Three structural facts, each a neutral statement about the packaging and process. */
const FACTS: { Icon: IconComponent; label: string }[] = [
  { Icon: VialIcon, label: "Batch reference on every unit" },
  { Icon: ClipboardCheckIcon, label: "Batch-specific COA available" },
  { Icon: EnvelopeIcon, label: "Request by email" },
];

const PARAGRAPH =
  "Each unit is labelled with a batch reference. Batch-specific certificates of analysis are issued against that reference and can be requested from the Kinetus BioLabs team by email.";

/**
 * "Batch documentation" section: shown on the Research page always and on any range
 * with nothing published. A white bordered panel with three icon facts, one paragraph
 * and a solid button to the contact page.
 */
export function DocumentationSection() {
  return (
    <Container
      as="section"
      id={DOCUMENTATION_SECTION_ID}
      className={styles.section}
      aria-labelledby="documentation-heading"
      data-reveal=""
    >
      <SectionDivider id="documentation-heading" title="Batch Documentation" />

      <div className={styles.panel}>
        <ul className={styles.facts} aria-label="Documentation facts">
          {FACTS.map(({ Icon, label }) => (
            <li key={label} className={styles.fact}>
              <span className={styles.factIcon}>
                <Icon size={32} />
              </span>
              <span className={styles.factLabel}>{label}</span>
            </li>
          ))}
        </ul>

        <p className={styles.paragraph}>{PARAGRAPH}</p>

        <div className={styles.actions}>
          <Link href={CONTACT_LINK.href} className={buttons.solid}>
            Request documentation
          </Link>
        </div>
      </div>
    </Container>
  );
}
