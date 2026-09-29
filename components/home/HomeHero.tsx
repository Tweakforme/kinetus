import { HERO_PHOTO, PageHero } from "@/components/ui/PageHero";
import styles from "./HomeHero.module.css";

const PARAGRAPH =
  "Kinetus BioLabs supplies research-grade peptide materials to laboratories across Canada. Every unit carries a batch reference, and batch-specific documentation is available.";

/**
 * Homepage hero (deck slide 4): the shared navy PageHero with the two-line uppercase
 * headline, the default eyebrow and packaging icon row. It has no call to action of its
 * own: the SHOP ALL PRODUCTS bar directly below it is the page's first call to action
 * (the client asked for the hero's "Shop research peptides" button to be removed).
 * Each headline line is kept whole from the desktop breakpoint up so the break always
 * falls after "PEPTIDES." as on the deck.
 *
 * Behind it, the hero photograph (2880 x 882) with the navy field, the falloff and the
 * vials built in. It is a CSS background, so PageHero preloads it.
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
      backgroundImage={HERO_PHOTO}
    />
  );
}
