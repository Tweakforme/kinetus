import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { SectionHeading } from "@/components/home/SectionHeading";
import { Container } from "@/components/layout/Container";
import { SectionRule } from "@/components/marks/SectionRule";
import { DocumentationList } from "@/components/product/DocumentationList";
import { ProductBreadcrumb } from "@/components/product/ProductBreadcrumb";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductJsonLd } from "@/components/product/ProductJsonLd";
import { SpecTable } from "@/components/product/SpecTable";
import { TrustMarkers } from "@/components/product/TrustMarkers";
import { VariantPanel } from "@/components/product/VariantPanel";
import {
  collectDocuments,
  descriptionParagraphs,
  getAllProductSlugs,
  getProductBySlug,
  getProductRedirectTarget,
  getRelatedProducts,
  specificationRows,
  toProductCardModel,
  toVariantViews,
} from "@/lib/products";
import { canonicalUrl, DEFAULT_DESCRIPTION } from "@/lib/seo";
import { CONTACT_LINK, SITE_NAME } from "@/lib/site";
import styles from "./page.module.css";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

const RELATED_LIMIT = 4;

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
 * Product detail — the only routable catalogue entity. Variants are UI state.
 * Section order follows the approved Figma frames (22:3 desktop / 55:7 mobile); Phase 6
 * adds the indexed mono eyebrows, structural hairlines and the spec-table showpiece
 * without changing that order. The persistent research-use band is rendered by the
 * root layout above the footer.
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

  // Sale windows are evaluated when the page is (re)generated — see `revalidate` above.
  const now = new Date();
  const variants = toVariantViews(product.variants, now);
  const specRows = specificationRows(product);
  const documents = collectDocuments(product);
  const paragraphs = descriptionParagraphs(product.description);
  const collections = product.collections.map((link) => link.collection);
  const related = (await getRelatedProducts(product.id, RELATED_LIMIT)).map((item) =>
    toProductCardModel(item, now),
  );

  const pageUrl = canonicalUrl(`/products/${product.slug}`);
  const firstSku = product.variants.find((variant) => variant.sku)?.sku ?? null;

  return (
    <article className={styles.page}>
      <Container className={styles.heroBlock} data-reveal="">
        <ProductBreadcrumb productName={product.name} />

        <div className={styles.hero}>
          <ProductGallery
            images={product.images.map((image) => ({
              id: image.id,
              url: image.url,
              altText: image.altText,
            }))}
            productName={product.name}
          />

          <div className={styles.details}>
            <div className={styles.identity}>
              <p className={`type-label ${styles.eyebrow}`}>Research material</p>
              <h1 className={`type-h1 ${styles.name}`}>{product.name}</h1>
              {product.shortDescription && (
                <p className={styles.shortDescription}>{product.shortDescription}</p>
              )}
            </div>

            <VariantPanel variants={variants} />

            <Link href={CONTACT_LINK.href} className={`type-label ${styles.cta}`}>
              Contact us
            </Link>

            <TrustMarkers />
          </div>
        </div>
      </Container>

      {specRows.length > 0 && (
        <Container
          as="section"
          className={styles.section}
          data-reveal=""
          aria-labelledby="specifications-heading"
        >
          <SectionRule />
          <SectionHeading
            id="specifications-heading"
            index="01"
            eyebrow="Data"
            title="Specifications"
          />
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
          <SectionRule />
          <SectionHeading
            id="documentation-heading"
            index="02"
            eyebrow="Files"
            title="Documentation"
          />
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
          <SectionRule />
          <SectionHeading id="description-heading" index="03" eyebrow="Notes" title="Description" />
          <div className={styles.description}>
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="type-body">
                {paragraph}
              </p>
            ))}
          </div>
        </Container>
      )}

      {collections.length > 0 && (
        <Container
          as="section"
          className={styles.collections}
          aria-labelledby="collections-heading"
          data-reveal=""
        >
          <SectionRule />
          <h2 id="collections-heading" className={`type-label ${styles.eyebrow}`}>
            <span className={`numeric ${styles.eyebrowIndex}`}>04</span>{" "}
            <span aria-hidden="true" className={styles.eyebrowSlash}>
              /
            </span>
            Part of
          </h2>
          <ul className={styles.collectionList}>
            {collections.map((collection) => (
              <li key={collection.id}>
                <Link
                  href={`/collections/${collection.slug}`}
                  className={`type-label ${styles.collectionLink}`}
                >
                  {collection.name}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      )}

      {related.length > 0 && (
        <Container
          as="section"
          className={styles.section}
          data-reveal=""
          aria-labelledby="related-heading"
        >
          <SectionRule />
          <SectionHeading
            id="related-heading"
            index="05"
            eyebrow="Materials"
            title="Related products"
          />
          <ul className={styles.relatedGrid}>
            {related.map((item, index) => (
              <li key={item.id} className={styles.relatedItem} data-reveal="">
                <ProductCard product={item} index={index + 1} />
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
