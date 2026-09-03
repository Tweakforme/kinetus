import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { FlaskIcon, HexagonIcon, ShieldCheckIcon } from "@/components/product/ProductIcons";
import { CONTACT_LINK } from "@/lib/site";
import { SectionHeading } from "./SectionHeading";
import buttons from "./buttons.module.css";
import styles from "./QualitySection.module.css";

/**
 * Quality & documentation — Figma 43:90 / 65:93: full-bleed bg/subtle band, packaging
 * eyebrow, H2, diamond rule, three columns (packaging icon set), one secondary link.
 * Column titles are verbatim packaging strings; the supporting copy is structural only
 * (documentation issuance, batch identification, listed product information).
 */
const PILLARS = [
  {
    title: "LAB VERIFIED PURITY & POTENCY",
    copy: "Documentation is issued against the batch reference printed on each unit.",
    Icon: ShieldCheckIcon,
  },
  {
    title: "THIRD-PARTY TESTED",
    copy: "Batch records are kept on file and can be requested for any listed material.",
    Icon: FlaskIcon,
  },
  {
    title: "RESEARCH GRADE MATERIAL",
    copy: "Form, appearance and storage conditions are listed on every product page.",
    Icon: HexagonIcon,
  },
] as const;

export function QualitySection() {
  return (
    <section className={styles.band} aria-labelledby="home-quality-heading" data-reveal="">
      <Container className={styles.inner}>
        <SectionHeading
          id="home-quality-heading"
          eyebrow="Quality you can trust"
          title="Batch-specific documentation"
        />

        <div className={styles.divider} aria-hidden="true">
          <span className={styles.rule} />
          <svg
            className={styles.diamond}
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            focusable="false"
          >
            <path d="M6 1L11 6L6 11L1 6L6 1Z" fill="currentColor" />
          </svg>
          <span className={styles.rule} />
        </div>

        <ul className={styles.columns}>
          {PILLARS.map(({ title, copy, Icon }) => (
            <li key={title} className={styles.column} data-reveal="">
              <Icon className={styles.icon} />
              <h3 className={`type-label ${styles.title}`}>{title}</h3>
              <p className={`type-body-s ${styles.copy}`}>{copy}</p>
            </li>
          ))}
        </ul>

        <div className={styles.actions}>
          <Link
            href={CONTACT_LINK.href}
            prefetch={CONTACT_LINK.prefetch === false ? false : undefined}
            className={`type-label ${buttons.secondary}`}
          >
            Contact us
          </Link>
        </div>
      </Container>
    </section>
  );
}
