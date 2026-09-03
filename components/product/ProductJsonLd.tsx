import { SITE_NAME } from "@/lib/site";

type BreadcrumbItem = {
  name: string;
  url: string;
};

type ProductJsonLdProps = {
  name: string;
  description: string | null;
  /** Absolute image URLs, primary first. */
  images: string[];
  sku: string | null;
  url: string;
  breadcrumb: BreadcrumbItem[];
};

/**
 * Product + BreadcrumbList structured data for one product page.
 * Deliberately no `Offer`: the site has no transactional path, so an offer would
 * misrepresent it. Brand is the confirmed site name only.
 */
export function ProductJsonLd({
  name,
  description,
  images,
  sku,
  url,
  breadcrumb,
}: ProductJsonLdProps) {
  const product: Record<string, unknown> = {
    "@type": "Product",
    "@id": `${url}#product`,
    name,
    url,
    brand: { "@type": "Brand", name: SITE_NAME },
  };
  if (description) {
    product.description = description;
  }
  if (images.length > 0) {
    product.image = images;
  }
  if (sku) {
    product.sku = sku;
  }

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      product,
      {
        "@type": "BreadcrumbList",
        itemListElement: breadcrumb.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
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
