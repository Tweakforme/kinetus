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
