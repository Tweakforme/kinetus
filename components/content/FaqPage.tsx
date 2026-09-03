import Link from "next/link";
import buttons from "@/components/home/buttons.module.css";
import { Container } from "@/components/layout/Container";
import { ChevronIcon } from "@/components/layout/NavIcons";
import { RegistrationMarks } from "@/components/marks/RegistrationMarks";
import { SectionRule } from "@/components/marks/SectionRule";
import type { ContentBlock, FaqDocument } from "@/content/types";
import { canonicalUrl } from "@/lib/seo";
import { CONTACT_LINK, SITE_NAME } from "@/lib/site";
import { ContentBlocks } from "./ContentBlocks";
import { ContentHeader } from "./ContentHeader";
import { ContentJsonLd } from "./ContentJsonLd";
import layout from "./ContentLayout.module.css";
import styles from "./FaqPage.module.css";

type FaqPageProps = {
  doc: FaqDocument;
};

/** Plain-text answer for FAQPage structured data. */
function answerText(blocks: ContentBlock[]): string {
  return blocks
    .map((block) => {
      if (block.type === "list") return block.items.join("\n");
      if (block.type === "lines") return block.lines.join("\n");
      return block.text;
    })
    .join("\n\n");
}

/**
 * FAQ: header, sticky mono contents (one entry per group), native disclosure
 * accordions grouped under the document's own headings, closing block, and FAQPage
 * structured data built from the published questions only.
 */
export function FaqPage({ doc }: FaqPageProps) {
  const published = doc.groups.flatMap((group) => group.entries);

  return (
    <article className={layout.page}>
      <ContentHeader kicker={SITE_NAME} title={doc.title} lede={doc.intro} breadcrumbLabel="FAQ" />

      <Container className={layout.body} data-reveal="">
        <SectionRule />

        <nav className={layout.contents} aria-label="Contents">
          <p className={`type-label ${layout.contentsLabel}`}>Contents</p>
          <ol className={layout.contentsList}>
            {doc.groups.map((group, index) => (
              <li key={group.id} className={layout.contentsItem}>
                <a href={`#${group.id}`} className={layout.contentsLink}>
                  <span className={`numeric ${layout.contentsNumber}`}>
                    {String(index + 1).padStart(2, "0")}
                  </span>{" "}
                  <span>{group.heading}</span>
                </a>
              </li>
            ))}
            <li className={layout.contentsItem}>
              <a href="#still-have-questions" className={layout.contentsLink}>
                <span className={`numeric ${layout.contentsNumber}`}>
                  {String(doc.groups.length + 1).padStart(2, "0")}
                </span>{" "}
                <span>{doc.closingHeading}</span>
              </a>
            </li>
          </ol>
        </nav>

        <div className={`${layout.prose} ${styles.prose}`}>
          {doc.groups.map((group, groupIndex) => (
            <section
              key={group.id}
              id={group.id}
              className={layout.section}
              aria-labelledby={`${group.id}-heading`}
            >
              <h2 id={`${group.id}-heading`} className={`type-h3 ${layout.sectionHeading}`}>
                <span className={`type-label numeric ${layout.sectionNumber}`}>
                  {String(groupIndex + 1).padStart(2, "0")}
                </span>{" "}
                <span>{group.heading}</span>
              </h2>

              <div className={styles.entries}>
                {group.entries.map((entry, entryIndex) => (
                  <details key={entry.id} id={entry.id} className={styles.entry}>
                    <summary className={styles.summary}>
                      <span
                        className={`type-label numeric ${styles.entryIndex}`}
                        aria-hidden="true"
                      >
                        {String(entryIndex + 1).padStart(2, "0")}
                      </span>
                      <span className={styles.question}>{entry.question}</span>
                      <ChevronIcon className={styles.chevron} />
                    </summary>
                    <div className={styles.answer}>
                      <ContentBlocks blocks={entry.answer} />
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}

          <section
            id="still-have-questions"
            className={layout.section}
            aria-labelledby="still-have-questions-heading"
          >
            <h2 id="still-have-questions-heading" className={`type-h3 ${layout.sectionHeading}`}>
              <span className={`type-label numeric ${layout.sectionNumber}`}>
                {String(doc.groups.length + 1).padStart(2, "0")}
              </span>{" "}
              <span>{doc.closingHeading}</span>
            </h2>
            <div className={layout.closing}>
              <RegistrationMarks />
              <ContentBlocks blocks={doc.closing} />
              <div className={styles.closingAction}>
                <Link href={CONTACT_LINK.href} className={`type-label ${buttons.secondary}`}>
                  Contact us
                </Link>
              </div>
            </div>
          </section>
        </div>
      </Container>

      <ContentJsonLd
        breadcrumb={[
          { name: "Home", url: canonicalUrl("/") },
          { name: "FAQ", url: canonicalUrl(`/${doc.slug}`) },
        ]}
        faq={published.map((entry) => ({
          question: entry.question,
          answer: answerText(entry.answer),
        }))}
      />
    </article>
  );
}
