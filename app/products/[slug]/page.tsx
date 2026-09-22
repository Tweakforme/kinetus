import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import {
  ClipboardCheckIcon,
  HexagonIcon,
  MapleLeafIcon,
  MicroscopeIcon,
  ShieldCheckIcon,
} from "@/components/icons/LineIcons";
import { Container } from "@/components/layout/Container";
import { DocumentationList } from "@/components/product/DocumentationList";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductHero } from "@/components/product/ProductHero";
import { ProductInfoBand } from "@/components/product/ProductInfoBand";
import { ProductJsonLd } from "@/components/product/ProductJsonLd";
import type { SelectableVariant } from "@/components/product/ProductSelection";
import { SpecTable } from "@/components/product/SpecTable";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { TrustBar, type TrustItem } from "@/components/ui/TrustBar";
import {
  collectDocuments,
  descriptionParagraphs,
  formatCad,
  getAllProductSlugs,
  getProductBySlug,
  getProductRedirectTarget,
  getRelatedProducts,
  specificationRows,
  toProductCardModel,
  toVariantViews,
} from "@/lib/products";
import { canonicalUrl, DEFAULT_DESCRIPTION } from "@/lib/seo";
import { PACKAGING, SITE_NAME } from "@/lib/site";
import styles from "./page.module.css";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

const RELATED_LIMIT = 4;
const HEADING_ID = "product-heading";

/**
 * Trust card under the information band (deck slide 9). Titles are the client's
 * packaging strings or neutral facts; the deck's "INDEPENDENTLY VERIFIED",
 * "HPLC & LC-MS/MS VERIFIED" and "CONSISTENT QUALITY" are replaced.
 */
const TRUST_ITEMS: TrustItem[] = [
  {
    Icon: ShieldCheckIcon,
    title: PACKAGING.thirdPartyTested,
    copy: "Independent laboratory testing",
  },
  {
    Icon: ClipboardCheckIcon,
    title: PACKAGING.batchCoa,
    copy: "Issued against the batch reference",
  },
  { Icon: MicroscopeIcon, title: PACKAGING.labVerified, copy: "Client packaging statement" },
  { Icon: HexagonIcon, title: PACKAGING.researchGrade, copy: "Supplied for laboratory research" },
  { Icon: MapleLeafIcon, title: "Proudly Canadian", copy: "Based in Canada", accent: "red" },
];

/**
 * Pages are statically generated. This time-based regeneration is a safety net so sale
 * windows, stock and content edits refresh within the hour; Phase 7 adds on-demand
 * revalidation on admin save.
 */
export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return {};
  }

  const title = product.metaTitle ?? product.name;
  const description = product.metaDescription ?? product.shortDescription ?? DEFAULT_DESCRIPTION;
  const canonical = canonicalUrl(`/products/${product.slug}`);
  const primaryImage = product.images[0];
  // Nested metadata objects replace the root layout's rather than merge, so site name,
  // locale and the social card are restated here.
  const shareImages = primaryImage
    ? [{ url: canonicalUrl(primaryImage.url), alt: primaryImage.altText }]
    : [{ url: canonicalUrl("/kinetus-logo.png"), alt: SITE_NAME }];

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_CA",
      url: canonical,
      title,
      description,
      images: shareImages,
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: shareImages.map((image) => image.url),
    },
  };
}

/**
 * Product detail, the only routable catalogue entity; variants are UI state. Order
 * (deck slides 9 and 13): hero, information band, specifications / documentation /
 * description when the catalogue has them, trust card, related materials. The
 * persistent research-use band is rendered by the root layout above the footer.
 */
export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    const target = await getProductRedirectTarget(slug);
    if (target) {
      permanentRedirect(`/products/${target}`);
    }
    notFound();
  }

  // Sale windows are evaluated when the page is (re)generated; see `revalidate` above.
  const now = new Date();
  const variants: SelectableVariant[] = toVariantViews(product.variants, now).map((variant) => ({
    ...variant,
    priceLabel: formatCad(variant.priceCents),
    compareAtLabel: variant.compareAtCents !== null ? formatCad(variant.compareAtCents) : null,
  }));
  // Form already appears in the information band, so the table lists the other fields only.
  const specRows = specificationRows(product).filter((row) => row.key !== "Form");
  const documents = collectDocuments(product);
  const paragraphs = descriptionParagraphs(product.description);
  const collectionSlugs = product.collections.map((link) => link.collection.slug);
  const related = (await getRelatedProducts(product.id, RELATED_LIMIT)).map((item) =>
    toProductCardModel(item, now),
  );

  const pageUrl = canonicalUrl(`/products/${product.slug}`);
  const firstSku = product.variants.find((variant) => variant.sku)?.sku ?? null;

  return (
    <article className={styles.page}>
      <ProductHero
        product={product}
        variants={variants}
        collectionSlugs={collectionSlugs}
        headingId={HEADING_ID}
      />

      <Container as="section" className={styles.band} data-reveal="" aria-label="Unit information">
        <ProductInfoBand
          form={product.form}
          presentations={variants.map((variant) => variant.label)}
        />
      </Container>

      {specRows.length > 0 && (
        <Container
          as="section"
          className={styles.section}
          data-reveal=""
          aria-labelledby="specifications-heading"
        >
          <SectionDivider id="specifications-heading" title="Specifications" />
          <SpecTable rows={specRows} />
        </Container>
      )}

      {documents.length > 0 && (
        <Container
          as="section"
          className={styles.section}
          data-reveal=""
          aria-labelledby="documentation-heading"
        >
          <SectionDivider id="documentation-heading" title="Documentation" />
          <DocumentationList documents={documents} />
        </Container>
      )}

      {paragraphs.length > 0 && (
        <Container
          as="section"
          className={styles.section}
          data-reveal=""
          aria-labelledby="description-heading"
        >
          <SectionDivider id="description-heading" title="Description" />
          <div className={styles.description}>
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="type-body">
                {paragraph}
              </p>
            ))}
          </div>
        </Container>
      )}

      <Container
        as="section"
        className={styles.section}
        data-reveal=""
        aria-label="Packaging statements"
      >
        <div className={styles.trust}>
          <TrustBar items={TRUST_ITEMS} variant="card" label="Packaging statements" />
        </div>
      </Container>

      {related.length > 0 && (
        <Container
          as="section"
          className={styles.section}
          data-reveal=""
          aria-labelledby="related-heading"
        >
          <SectionDivider id="related-heading" title="Related materials" />
          <ul className={styles.relatedGrid}>
            {related.map((item) => (
              <li key={item.id} className={styles.relatedItem}>
                <ProductCard product={item} />
              </li>
            ))}
          </ul>
        </Container>
      )}

      <ProductJsonLd
        name={product.name}
        description={product.shortDescription ?? product.metaDescription}
        images={product.images.map((image) => canonicalUrl(image.url))}
        sku={firstSku}
        url={pageUrl}
        breadcrumb={[
          { name: "Home", url: canonicalUrl("/") },
          { name: "Products", url: canonicalUrl("/products") },
          { name: product.name, url: pageUrl },
        ]}
      />
    </article>
  );
}
