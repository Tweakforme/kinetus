import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { DiamondRule } from "@/components/marks/DiamondRule";
import { RegistrationMarks } from "@/components/marks/RegistrationMarks";
import { SectionRule } from "@/components/marks/SectionRule";
import { FlaskIcon, HexagonIcon, ShieldCheckIcon } from "@/components/product/ProductIcons";
import { CONTACT_LINK } from "@/lib/site";
import { SectionHeading } from "./SectionHeading";
import buttons from "./buttons.module.css";
import styles from "./QualitySection.module.css";

/**
 * Quality & documentation — Figma 43:90 / 65:93: full-bleed bg/subtle band, indexed
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
    copy: "Where documentation exists for a batch, it is listed on the product page or can be requested.",
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
      <SectionRule bleed />
      <Container>
        <div className={styles.frame}>
          <RegistrationMarks />
          <SectionHeading
            id="home-quality-heading"
            index="03"
            eyebrow="Documentation"
            title="Batch-specific documentation"
          />

          <DiamondRule />

          <ul className={styles.columns}>
            {PILLARS.map(({ title, copy, Icon }, index) => (
              <li key={title} className={styles.column} data-reveal="">
                <span className={styles.columnHead}>
                  <Icon className={styles.icon} />
                  <span className={`type-label numeric ${styles.columnIndex}`} aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </span>
                <h3 className={`type-label ${styles.title}`}>{title}</h3>
                <p className={`type-body-s ${styles.copy}`}>{copy}</p>
              </li>
            ))}
          </ul>

          <div className={styles.actions}>
            <Link href={CONTACT_LINK.href} className={`type-label ${buttons.secondary}`}>
              Contact us
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
