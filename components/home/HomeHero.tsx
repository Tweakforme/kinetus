import { PageHero } from "@/components/ui/PageHero";
import { COLLECTION_SLUGS, SITE_NAME, collectionHref } from "@/lib/site";
import styles from "./HomeHero.module.css";

/** Keyed client render (public/products), composited right of centre by PageHero. */
export const HOME_HERO_IMAGE = "/products/kinetus-vial-and-blank-box-cut.png";
export const HOME_HERO_IMAGE_ALT = `${SITE_NAME} vial and box (product render)`;

const PARAGRAPH =
  "Kinetus BioLabs supplies research-grade peptide materials to laboratories across Canada. Every unit carries a batch reference, and batch-specific documentation is available.";

/**
 * Homepage hero (deck slide 4): the shared navy PageHero with the two-line uppercase
 * headline, the default eyebrow and packaging icon row, and the teal call to action.
 * Each headline line is kept whole from the desktop breakpoint up so the break always
 * falls after "PEPTIDES." as on the deck.
 *
 * The client's homepage mockup ("Kinetus Home Page.png") sets a photographed laboratory
 * behind this hero. The mockup is the only source of that photograph: its hero band is
 * 1614 x 399 px, too small for a 1920px-wide hero (1.4x upscaled, 2.8x on high-density
 * screens), and it has the mockup's own headline, icon row and three labelled vials baked
 * in. The hero keeps the navy gradient until a clean photograph (no text or product, at
 * least 2880 px wide) is supplied; it would go behind the gradient in PageHero's backdrop.
 */
export function HomeHero() {
  return (
    <PageHero
      variant="home"
      headingId="home-hero-heading"
      headline={
        <>
          <span className={styles.line}>RESEARCH PEPTIDES.</span>
          <br />
          <span className={styles.line}>VERIFIED QUALITY.</span>
        </>
      }
      paragraph={PARAGRAPH}
      cta={{ label: "Shop research peptides", href: collectionHref(COLLECTION_SLUGS.peptides) }}
      image={{ src: HOME_HERO_IMAGE, alt: HOME_HERO_IMAGE_ALT }}
    />
  );
}
