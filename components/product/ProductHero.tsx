import { DnaHelix } from "@/components/decor/DnaHelix";
import { HexLattice } from "@/components/decor/HexLattice";
import { Container } from "@/components/layout/Container";
import { RichText } from "@/components/ui/RichText";
import type { VolumeTier } from "@/lib/pricing";
import { DEFAULT_PRODUCT_INTRO, productKindLabel, type ProductDetail } from "@/lib/products";
import { COLLECTION_SLUGS, RESEARCH_USE_COPY } from "@/lib/site";
import { ProductBreadcrumb } from "./ProductBreadcrumb";
import { ProductGallery } from "./ProductGallery";
import { ProductResources } from "./ProductResources";
import { ProductSizeLine } from "./ProductSizeLine";
import { VariantPanel } from "./VariantPanel";
import styles from "./ProductHero.module.css";

type ProductHeroProps = {
  product: ProductDetail;
  /** Images the page may show (product level plus active variants'), primary first. */
  images: ProductDetail["images"];
  /** Active volume discount tiers, shown in the panel. */
  tiers: VolumeTier[];
  /** Slugs of the product's published collections, used for the eyebrow. */
  collectionSlugs: string[];
  /** Admin > Settings "Product page text"; null or blank uses DEFAULT_PRODUCT_INTRO. */
  introText: string | null;
  /** Id of the h1, for the section's accessible name. */
  headingId: string;
};

/**
 * Product hero (deck slides 9 and 13): white ground, ghosted hex lattice behind the
 * render and a ghosted DNA helix at the page's right edge, three columns at desktop
 * (copy / render / sticky panel). The selected size drives the size line here, the price
 * in the panel and the render (each strength shows its own render, or the product-level
 * fallback) and the Test Reports badge through ProductSelectionProvider, which the
 * product page wraps around the hero; the heading and copy stay server-rendered. The
 * document badges and the optional "Text below buttons" sit in the left column under the
 * fixed paragraph, beside the gallery.
 */
export function ProductHero({
  product,
  images,
  tiers,
  collectionSlugs,
  introText,
  headingId,
}: ProductHeroProps) {
  const isBlend = collectionSlugs.includes(COLLECTION_SLUGS.blends);
  const subhead = product.form ? `Research material · ${product.form}` : "Research material";
  // The research-use line always closes the intro, in the same paragraph as its last line.
  const intro = `${introText?.trim() || DEFAULT_PRODUCT_INTRO} ${RESEARCH_USE_COPY}`;

  return (
    <section className={styles.hero} aria-labelledby={headingId}>
      <DnaHelix className={styles.helix} />

      <Container className={styles.inner}>
        <div className={styles.breadcrumb}>
          <ProductBreadcrumb productName={product.name} />
        </div>

        <div className={styles.grid}>
          <HexLattice className={styles.lattice} />

          <div className={styles.identity}>
            <p className={`type-eyebrow ${styles.eyebrow}`}>{productKindLabel(collectionSlugs)}</p>
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
            <div className={styles.intro}>
              <RichText text={intro} paragraphClassName={styles.paragraph} />
            </div>
            <ProductResources
              productName={product.name}
              sheet={
                product.informationSheetUrl
                  ? {
                      url: product.informationSheetUrl,
                      alt:
                        product.informationSheetAlt ?? `${product.name} product information sheet`,
                    }
                  : null
              }
              text={product.productInfoText}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
