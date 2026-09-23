import { SITE_NAME } from "@/lib/site";

type BreadcrumbItem = {
  name: string;
  url: string;
};

export type OfferData = {
  /** Variant label, e.g. "10 MG". */
  name: string;
  sku: string | null;
  priceCents: number;
  inStock: boolean;
  /** YYYY-MM-DD, only while a sale with an end date is active. */
  priceValidUntil: string | null;
};

type ProductJsonLdProps = {
  name: string;
  description: string | null;
  /** Absolute image URLs, primary first. */
  images: string[];
  sku: string | null;
  url: string;
  breadcrumb: BreadcrumbItem[];
  /** One offer per active variant, at the price the page shows. */
  offers: OfferData[];
};

/**
 * Product + BreadcrumbList structured data for one product page, with an `Offer` per
 * active variant now that the cart and checkout exist (Phase 8): price in CAD,
 * availability from stock, and priceValidUntil while a dated sale runs. Brand and seller
 * are the confirmed site name only.
 */
export function ProductJsonLd({
  name,
  description,
  images,
  sku,
  url,
  breadcrumb,
  offers,
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
  if (offers.length > 0) {
    product.offers = offers.map((offer) => {
      const data: Record<string, unknown> = {
        "@type": "Offer",
        name: offer.name,
        url,
        price: (offer.priceCents / 100).toFixed(2),
        priceCurrency: "CAD",
        availability: offer.inStock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@type": "Organization", name: SITE_NAME },
      };
      if (offer.sku) {
        data.sku = offer.sku;
      }
      if (offer.priceValidUntil) {
        data.priceValidUntil = offer.priceValidUntil;
      }
      return data;
    });
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
