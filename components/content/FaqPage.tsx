import Link from "next/link";
import { ChevronDownIcon } from "@/components/icons/LineIcons";
import { Container } from "@/components/layout/Container";
import buttons from "@/components/ui/buttons.module.css";
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
 * FAQ: navy band, sticky contents (one entry per group), native disclosure accordions
 * as white cards grouped under the document's own headings, the closing block with a
 * contact button, and FAQPage structured data built from the published questions only.
 */
export function FaqPage({ doc }: FaqPageProps) {
  const published = doc.groups.flatMap((group) => group.entries);
  const closingIndex = String(doc.groups.length + 1).padStart(2, "0");

  return (
    <article className={layout.page}>
      <ContentHeader eyebrow={SITE_NAME} title={doc.title} lede={doc.intro} breadcrumbLabel="FAQ" />

      <Container className={layout.body} data-reveal="">
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
                <span className={`numeric ${layout.contentsNumber}`}>{closingIndex}</span>{" "}
                <span>{doc.closingHeading}</span>
              </a>
            </li>
          </ol>
        </nav>

        <div className={`${layout.prose} ${styles.prose}`}>
          {doc.groups.map((group) => (
            <section
              key={group.id}
              id={group.id}
              className={layout.section}
              aria-labelledby={`${group.id}-heading`}
            >
              <h2 id={`${group.id}-heading`} className={`type-h2 ${styles.groupHeading}`}>
                {group.heading}
              </h2>

              <div className={styles.entries}>
                {group.entries.map((entry) => (
                  <details key={entry.id} id={entry.id} className={styles.entry}>
                    <summary className={styles.summary}>
                      <span className={styles.question}>{entry.question}</span>
                      <ChevronDownIcon size={20} className={styles.chevron} />
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
            <h2 id="still-have-questions-heading" className={`type-h2 ${styles.groupHeading}`}>
              {doc.closingHeading}
            </h2>
            <div className={layout.closing}>
              <ContentBlocks blocks={doc.closing} />
              <div className={styles.closingAction}>
                <Link href={CONTACT_LINK.href} className={buttons.solid}>
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
