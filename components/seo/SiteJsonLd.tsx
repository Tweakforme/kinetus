import { canonicalUrl, getSiteUrl } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

/**
 * Site-level structured data: Organization + WebSite (schema.org), rendered once in
 * the root layout. Only confirmed facts are included.
 *
 * TODO: confirm before launch:
 *   - legal entity name / incorporation status (no `legalName` is emitted)
 *   - street address (only addressCountry "CA" is emitted)
 *   - public contact email / telephone (none is emitted)
 *
 * Product, ItemList, FAQPage and BreadcrumbList schemas are deferred to the phases
 * that create the content they describe.
 */
export function SiteJsonLd() {
  const origin = getSiteUrl();
  const organizationId = `${origin}/#organization`;
  const websiteId = `${origin}/#website`;

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: SITE_NAME,
        url: canonicalUrl("/"),
        logo: {
          "@type": "ImageObject",
          url: canonicalUrl("/kinetus-logo.png"),
          width: 1515,
          height: 1038,
        },
        address: {
          "@type": "PostalAddress",
          addressCountry: "CA",
        },
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: SITE_NAME,
        url: canonicalUrl("/"),
        inLanguage: "en-CA",
        publisher: { "@id": organizationId },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // JSON is escaped so a "<" can never terminate the script element.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }}
    />
  );
}
