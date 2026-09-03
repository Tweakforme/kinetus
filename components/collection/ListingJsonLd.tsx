type ListItem = {
  name: string;
  url: string;
};

type ListingJsonLdProps = {
  /** ItemList name, e.g. the collection or page title. */
  listName: string;
  /** Absolute URLs of the listed products or collections, in display order. */
  items: ListItem[];
  /** Optional BreadcrumbList (collection pages only). */
  breadcrumb?: ListItem[];
};

/**
 * ItemList (+ optional BreadcrumbList) structured data for listing routes.
 * Deliberately no Offer markup: the site has no transactional path.
 */
export function ListingJsonLd({ listName, items, breadcrumb }: ListingJsonLdProps) {
  const graph: Record<string, unknown>[] = [
    {
      "@type": "ItemList",
      name: listName,
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: item.url,
      })),
    },
  ];

  if (breadcrumb && breadcrumb.length > 0) {
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: breadcrumb.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    });
  }

  const data = { "@context": "https://schema.org", "@graph": graph };

  return (
    <script
      type="application/ld+json"
      // JSON is escaped so a "<" can never terminate the script element.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
