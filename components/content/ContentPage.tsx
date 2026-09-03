import { Container } from "@/components/layout/Container";
import { RegistrationMarks } from "@/components/marks/RegistrationMarks";
import { SectionRule } from "@/components/marks/SectionRule";
import type { PolicyDocument } from "@/content/types";
import { canonicalUrl } from "@/lib/seo";
import { ContentBlocks } from "./ContentBlocks";
import { ContentHeader } from "./ContentHeader";
import { ContentJsonLd } from "./ContentJsonLd";
import layout from "./ContentLayout.module.css";

type ContentPageProps = {
  doc: PolicyDocument;
};

/** "1." from a numbered source, else a generated two-digit index. */
export function sectionNumber(number: string | null, index: number): string {
  return number ?? String(index + 1).padStart(2, "0");
}

/**
 * Policy page: header, sticky mono contents list, verbatim sections at the 580px
 * measure, closing block, BreadcrumbList structured data.
 */
export function ContentPage({ doc }: ContentPageProps) {
  const path = `/${doc.slug}`;

  return (
    <article className={layout.page}>
      <ContentHeader
        kicker={doc.kicker}
        title={doc.title}
        meta={doc.dateLabel && doc.date ? { label: doc.dateLabel, value: doc.date } : null}
      />

      <Container className={layout.body} data-reveal="">
        <SectionRule />

        <nav className={layout.contents} aria-label="Contents">
          <p className={`type-label ${layout.contentsLabel}`}>Contents</p>
          <ol className={layout.contentsList}>
            {doc.sections.map((section, index) => (
              <li key={section.id} className={layout.contentsItem}>
                <a href={`#${section.id}`} className={layout.contentsLink}>
                  <span className={`numeric ${layout.contentsNumber}`}>
                    {sectionNumber(section.number, index)}
                  </span>{" "}
                  <span>{section.heading}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className={layout.prose}>
          {doc.intro.length > 0 && (
            <div className={layout.blocks}>
              <ContentBlocks blocks={doc.intro} />
            </div>
          )}

          {doc.sections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              className={layout.section}
              aria-labelledby={`${section.id}-heading`}
            >
              <h2 id={`${section.id}-heading`} className={`type-h3 ${layout.sectionHeading}`}>
                <span className={`type-label numeric ${layout.sectionNumber}`}>
                  {sectionNumber(section.number, index)}
                </span>{" "}
                <span>{section.heading}</span>
              </h2>
              <div className={layout.blocks}>
                <ContentBlocks blocks={section.blocks} />
              </div>
            </section>
          ))}

          {doc.closing.length > 0 && (
            <div className={layout.closing}>
              <RegistrationMarks />
              <ContentBlocks blocks={doc.closing} />
            </div>
          )}
        </div>
      </Container>

      <ContentJsonLd
        breadcrumb={[
          { name: "Home", url: canonicalUrl("/") },
          { name: doc.title, url: canonicalUrl(path) },
        ]}
      />
    </article>
  );
}
