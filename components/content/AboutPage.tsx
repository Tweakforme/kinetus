import Link from "next/link";
import buttons from "@/components/home/buttons.module.css";
import { SectionHeading } from "@/components/home/SectionHeading";
import { Container } from "@/components/layout/Container";
import { RegistrationMarks } from "@/components/marks/RegistrationMarks";
import { SectionRule } from "@/components/marks/SectionRule";
import type { AboutDocument } from "@/content/types";
import { canonicalUrl } from "@/lib/seo";
import { ALL_PRODUCTS_LINK, CONTACT_LINK, SITE_NAME } from "@/lib/site";
import { ContentBlocks } from "./ContentBlocks";
import { ContentHeader } from "./ContentHeader";
import { ContentJsonLd } from "./ContentJsonLd";
import layout from "./ContentLayout.module.css";
import styles from "./AboutPage.module.css";

type AboutPageProps = {
  doc: AboutDocument;
};

const EXPLORE_LINKS = [
  ALL_PRODUCTS_LINK,
  { label: "Frequently asked questions", href: "/faq" },
  CONTACT_LINK,
];

/**
 * About: the client's "Why Choose Kinetus BioLabs" copy, verbatim, minus the
 * comparison table. The principle line is shown as four indexed statements.
 */
export function AboutPage({ doc }: AboutPageProps) {
  return (
    <article className={layout.page}>
      <ContentHeader kicker={SITE_NAME} title={doc.title} lede={doc.lede} />

      <Container className={styles.intro} data-reveal="">
        <SectionRule />
        <div className={`${layout.blocks} ${styles.introBlocks}`}>
          <ContentBlocks blocks={doc.intro} />
        </div>
      </Container>

      {doc.sections.map((section, index) => (
        <Container
          key={section.id}
          as="section"
          id={section.id}
          className={styles.section}
          aria-labelledby={`${section.id}-heading`}
          data-reveal=""
        >
          <SectionRule />
          <SectionHeading
            id={`${section.id}-heading`}
            index={String(index + 1).padStart(2, "0")}
            eyebrow="Approach"
            title={section.heading}
          />

          <div className={`${layout.blocks} ${styles.measure}`}>
            <ContentBlocks blocks={section.blocks} />
          </div>

          <div className={styles.principles}>
            <RegistrationMarks />
            <ol className={styles.principleList}>
              {section.principles.map((principle, principleIndex) => (
                <li key={principle} className={styles.principle} data-reveal="">
                  <span
                    className={`type-label numeric ${styles.principleIndex}`}
                    aria-hidden="true"
                  >
                    {String(principleIndex + 1).padStart(2, "0")}
                  </span>
                  <span className={`type-h3 ${styles.principleText}`}>{principle}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className={`${layout.blocks} ${styles.measure}`}>
            <ContentBlocks blocks={section.afterPrinciples} />
          </div>
        </Container>
      ))}

      <Container
        as="section"
        id="explore"
        className={styles.section}
        aria-labelledby="explore-heading"
        data-reveal=""
      >
        <SectionRule />
        <SectionHeading
          id="explore-heading"
          index={String(doc.sections.length + 1).padStart(2, "0")}
          eyebrow="Explore"
          title={doc.exploreHeading}
        />
        <p className={`type-body-s type-mono ${styles.exploreLine}`}>{doc.exploreLine}</p>
        <ul className={styles.exploreLinks}>
          {EXPLORE_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={`type-label ${buttons.secondary}`}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </Container>

      <Container data-reveal="">
        <div className={`${layout.closing} ${styles.measure}`}>
          <RegistrationMarks />
          <ContentBlocks blocks={doc.closing} />
        </div>
      </Container>

      <ContentJsonLd
        breadcrumb={[
          { name: "Home", url: canonicalUrl("/") },
          { name: "About", url: canonicalUrl(`/${doc.slug}`) },
        ]}
      />
    </article>
  );
}
