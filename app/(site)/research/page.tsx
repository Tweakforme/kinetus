import type { Metadata } from "next";
import Image from "next/image";
import { ListingPage } from "@/components/collection/ListingPage";
import { ShopByCategory } from "@/components/home/ShopByCategory";
import { ResearchClassification } from "@/components/research/ResearchClassification";
import { PAGE_HERO_PHOTOS, PageHero } from "@/components/ui/PageHero";
import { canonicalUrl, defaultShareImage } from "@/lib/seo";
import { RESEARCH_USE_COPY, SITE_NAME } from "@/lib/site";
import styles from "./page.module.css";

const TITLE = "Research";
const DESCRIPTION = `Research material categories in the ${SITE_NAME} catalogue. ${RESEARCH_USE_COPY}`;
const canonical = canonicalUrl("/research");

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_CA",
    url: canonical,
    title: TITLE,
    description: DESCRIPTION,
    images: [defaultShareImage()],
  },
};

const INTRO =
  "The catalogue is grouped into research material categories. Choose a category to see the materials in it; a material can appear in more than one category.";

/** The client's Research Material Categories graphic (1536 x 1024 WebP). */
const CATEGORIES_IMAGE = {
  src: "/images/research/research-categories.webp",
  width: 1536,
  height: 1024,
  alt: "Kinetus BioLabs research material categories",
};

/**
 * /research, the Research Area. The client's plan: "the Categories page at the top and
 * the information outlined in the word document below it". The photo hero, the client's
 * categories graphic directly under it, the client's Research Classification Outline
 * (published at AJ's direction, 2026-10-02; it was held back earlier because it describes
 * what the materials are studied for), then the category cards.
 */
export default function ResearchPage() {
  return (
    <ListingPage>
      <PageHero
        variant="category"
        headline={TITLE}
        headingId="research-heading"
        paragraph={INTRO}
        features={[]}
        backgroundImage={PAGE_HERO_PHOTOS.research}
      />

      <div className={styles.categories}>
        <div className={styles.categoriesScroll}>
          <Image
            src={CATEGORIES_IMAGE.src}
            alt={CATEGORIES_IMAGE.alt}
            width={CATEGORIES_IMAGE.width}
            height={CATEGORIES_IMAGE.height}
            sizes="(min-width: 1536px) 1536px, (min-width: 900px) 100vw, 900px"
            className={styles.categoriesImage}
          />
        </div>
      </div>

      <ResearchClassification />

      <ShopByCategory
        headingId="research-categories-heading"
        title="Research Material Categories"
        intro={<p className="type-body-s">{RESEARCH_USE_COPY}</p>}
      />
    </ListingPage>
  );
}
