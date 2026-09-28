import Image from "next/image";
import Link from "next/link";
import type { ComponentType, CSSProperties, ReactNode } from "react";
import { HexMesh } from "@/components/decor/HexMesh";
import {
  ClipboardCheckIcon,
  HexagonIcon,
  MicroscopeIcon,
  ShieldCheckIcon,
} from "@/components/icons/LineIcons";
import { blurPlaceholder } from "@/lib/images";
import { HERO_EYEBROW, PACKAGING } from "@/lib/site";
import buttons from "./buttons.module.css";
import styles from "./PageHero.module.css";

type IconComponent = ComponentType<{ size?: number; className?: string }>;

export type HeroFeature = {
  Icon: IconComponent;
  /** Two-line label; a "\n" marks the line break. */
  label: string;
};

type PageHeroProps = {
  /** "home" sets the headline uppercase and huge; "category" sets it mixed case. */
  variant: "home" | "category";
  headline: ReactNode;
  headingId: string;
  eyebrow?: string;
  paragraph: ReactNode;
  features?: HeroFeature[];
  cta?: { label: string; href: string };
  image: { src: string; alt: string };
  /**
   * A photograph behind the hero (the homepage). It carries its own navy field and
   * falloff, so the gradient layers are left out; the hex mesh stays above it.
   */
  backgroundImage?: string;
  /** Render the headline as an h1 (pages) or a p (never). Defaults to h1. */
  as?: "h1" | "h2";
};

/**
 * The four packaging strings as the deck's four hero icons (slide 4). The deck's
 * "HPLC & LC-MS/MS VERIFIED" is replaced by "BATCH-SPECIFIC COA AVAILABLE".
 */
export const DEFAULT_HERO_FEATURES: HeroFeature[] = [
  { Icon: ShieldCheckIcon, label: "THIRD-PARTY\nTESTED" },
  { Icon: HexagonIcon, label: "RESEARCH GRADE\nMATERIAL" },
  { Icon: MicroscopeIcon, label: "LAB VERIFIED\nPURITY & POTENCY" },
  { Icon: ClipboardCheckIcon, label: "BATCH-SPECIFIC\nCOA AVAILABLE" },
];

// Keep the packaging constants referenced so the strings above are visibly tied to them.
void PACKAGING;

/**
 * Full-bleed navy hero shared by the homepage and every category page (deck slides 4, 12,
 * 17): dark gradient deeper left and lighter right, faint hexagonal mesh in the upper
 * right, the client's keyed product render composited right of centre, cyan letterspaced
 * eyebrow, very large white headline, three-line white paragraph, thin-line icon row and
 * a solid teal button. Everything stacks on mobile.
 */
export function PageHero({
  variant,
  headline,
  headingId,
  eyebrow = HERO_EYEBROW,
  paragraph,
  features = DEFAULT_HERO_FEATURES,
  cta,
  image,
  backgroundImage,
  as: Heading = "h1",
}: PageHeroProps) {
  const blur = blurPlaceholder(image.src);
  const headlineClass =
    variant === "home" ? `type-hero ${styles.headline}` : `type-hero-mixed ${styles.headline}`;
  const classes = [
    styles.hero,
    variant === "home" ? styles.home : styles.category,
    backgroundImage ? styles.withPhoto : null,
  ]
    .filter(Boolean)
    .join(" ");
  const photo = backgroundImage
    ? ({ "--hero-photo": `url("${backgroundImage}")` } as CSSProperties)
    : undefined;

  return (
    <section className={classes} style={photo} aria-labelledby={headingId} data-reveal="">
      <div className={styles.backdrop} aria-hidden="true">
        {!backgroundImage && <div className={styles.glow} />}
        <HexMesh className={styles.mesh} cell={30} />
        {!backgroundImage && <div className={styles.vignette} />}
      </div>

      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={`type-eyebrow ${styles.eyebrow}`}>{eyebrow}</p>
          <Heading id={headingId} className={headlineClass}>
            {headline}
          </Heading>
          <p className={styles.paragraph}>{paragraph}</p>

          {features.length > 0 && (
            <ul className={styles.features}>
              {features.map(({ Icon, label }) => {
                const [first, second] = label.split("\n");
                return (
                  <li key={label} className={styles.feature}>
                    <Icon size={36} className={styles.featureIcon} />
                    <span className={styles.featureLabel}>
                      {first}
                      {second && (
                        <>
                          <br />
                          {second}
                        </>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          {cta && (
            <div className={styles.actions}>
              <Link href={cta.href} className={buttons.solid}>
                {cta.label}
              </Link>
            </div>
          )}
        </div>

        <div className={styles.render}>
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 1024px) 46vw, (min-width: 768px) 60vw, 100vw"
            className={styles.image}
            priority
            placeholder={blur ? "blur" : "empty"}
            blurDataURL={blur}
          />
        </div>
      </div>
    </section>
  );
}
