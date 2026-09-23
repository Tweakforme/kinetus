import { DnaHelix } from "@/components/decor/DnaHelix";
import { HexLattice } from "@/components/decor/HexLattice";
import { Container } from "@/components/layout/Container";
import type { VolumeTier } from "@/lib/pricing";
import { productKindLabel, type ProductDetail } from "@/lib/products";
import { COLLECTION_SLUGS, RESEARCH_USE_COPY } from "@/lib/site";
import { ProductBreadcrumb } from "./ProductBreadcrumb";
import { ProductFeatureRow } from "./ProductFeatureRow";
import { ProductGallery } from "./ProductGallery";
import { ProductSelectionProvider, type SelectableVariant } from "./ProductSelection";
import { ProductSizeLine } from "./ProductSizeLine";
import { VariantPanel } from "./VariantPanel";
import styles from "./ProductHero.module.css";

type ProductHeroProps = {
  product: ProductDetail;
  /** Images the page may show (product level plus active variants'), primary first. */
  images: ProductDetail["images"];
  variants: SelectableVariant[];
  /** Active volume discount tiers, shown in the panel. */
  tiers: VolumeTier[];
  /** Slugs of the product's published collections, used for the eyebrow. */
  collectionSlugs: string[];
  /** Id of the h1, for the section's accessible name. */
  headingId: string;
};

/** Neutral handling copy: how the unit arrives, nothing about what it does. */
const HANDLING_COPY = `Supplied in a sealed glass vial and labelled with a batch reference. Batch-specific documentation is available on request. ${RESEARCH_USE_COPY}`;

/**
 * Product hero (deck slides 9 and 13): white ground, ghosted hex lattice behind the
 * render and a ghosted DNA helix at the page's right edge, three columns at desktop
 * (copy / render / sticky panel). The selected size drives the size line here, the price
 * in the panel and the render (each strength shows its own render, or the product-level
 * fallback) through ProductSelectionProvider; the heading and copy stay server-rendered.
 */
export function ProductHero({
  product,
  images,
  variants,
  tiers,
  collectionSlugs,
  headingId,
}: ProductHeroProps) {
  const isBlend = collectionSlugs.includes(COLLECTION_SLUGS.blends);
  const subhead = product.form ? `Research material · ${product.form}` : "Research material";

  return (
    <section className={styles.hero} aria-labelledby={headingId}>
      <DnaHelix className={styles.helix} />

      <Container className={styles.inner}>
        <div className={styles.breadcrumb}>
          <ProductBreadcrumb productName={product.name} />
        </div>

        <ProductSelectionProvider variants={variants}>
          <div className={styles.grid}>
            <HexLattice className={styles.lattice} />

            <div className={styles.identity}>
              <p className={`type-eyebrow ${styles.eyebrow}`}>
                {productKindLabel(collectionSlugs)}
              </p>
              <h1 id={headingId} className={`type-product-name ${styles.name}`}>
                {product.name}
              </h1>
              <ProductSizeLine suffix={isBlend ? "blend" : undefined} />
            </div>

            <div className={styles.render}>
              <ProductGallery
                images={images.map((image) => ({
                  id: image.id,
                  url: image.url,
                  altText: image.altText,
                  variantId: image.variantId,
                }))}
                productName={product.name}
              />
            </div>

            <div className={styles.panel}>
              <VariantPanel tiers={tiers} />
            </div>

            <div className={styles.detail}>
              <p className={styles.subhead}>{subhead}</p>
              <p className={styles.paragraph}>{HANDLING_COPY}</p>
              <ProductFeatureRow form={product.form} />
            </div>
          </div>
        </ProductSelectionProvider>
      </Container>
    </section>
  );
}
