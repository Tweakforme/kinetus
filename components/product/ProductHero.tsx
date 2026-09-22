import { DnaHelix } from "@/components/decor/DnaHelix";
import { HexLattice } from "@/components/decor/HexLattice";
import { Container } from "@/components/layout/Container";
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
  variants: SelectableVariant[];
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
 * (copy / render / sticky panel). The selected size drives both the size line here and
 * the price in the panel through ProductSelectionProvider; the heading, copy and render
 * stay server-rendered.
 */
export function ProductHero({ product, variants, collectionSlugs, headingId }: ProductHeroProps) {
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
                images={product.images.map((image) => ({
                  id: image.id,
                  url: image.url,
                  altText: image.altText,
                }))}
                productName={product.name}
              />
            </div>

            <div className={styles.panel}>
              <VariantPanel />
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
