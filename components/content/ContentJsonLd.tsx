type BreadcrumbItem = {
  name: string;
  url: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

type ContentJsonLdProps = {
  breadcrumb: BreadcrumbItem[];
  /** Published FAQ entries only; emits an additional FAQPage graph. */
  faq?: FaqItem[];
};

/**
 * BreadcrumbList (and, for the FAQ, FAQPage) structured data for content pages.
 * No Offer or commerce types anywhere on the site.
 */
export function ContentJsonLd({ breadcrumb, faq }: ContentJsonLdProps) {
  const graphs: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumb.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    },
  ];

  if (faq && faq.length > 0) {
    graphs.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    });
  }

  return (
    <>
      {graphs.map((graph, index) => (
        <script
          key={index}
          type="application/ld+json"
          // JSON-LD is inert data; "<" is escaped so no markup can break out of the block.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }}
        />
      ))}
    </>
  );
}
