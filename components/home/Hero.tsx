import Image from "next/image";
import Link from "next/link";
import { RegistrationMarks } from "@/components/marks/RegistrationMarks";
import { blurPlaceholder } from "@/lib/images";
import { CONTACT_LINK, TAGLINE } from "@/lib/site";
import { HeroLinework } from "./HeroLinework";
import buttons from "./buttons.module.css";
import styles from "./Hero.module.css";

type HeroProps = {
  imageUrl: string;
  imageAlt: string;
};

/**
 * Hero — product-led split (Figma 39:41 desktop / 57:2 mobile; deck arrangement).
 * Phase 6: the copy column stays on the 1240 grid while the product panel bleeds past
 * the container's right edge to the viewport, and the Display XL headline overlaps the
 * panel's left edge. Below 1024px everything stacks inside the container.
 * Copy is structural: what the company supplies and how units are identified. The
 * deck's headline, benefit subhead and verification icon row are not reproduced.
 */
const HEADLINE = "Research materials, precisely documented.";
const PARAGRAPH =
  "A Canadian supplier of research materials for the scientific community, academic institutions and independent researchers. Every unit is labelled with a batch reference, and batch-specific documentation is available.";

export function Hero({ imageUrl, imageAlt }: HeroProps) {
  const blur = blurPlaceholder(imageUrl);

  return (
    <section className={styles.hero} aria-labelledby="hero-heading" data-reveal="">
      <div className={styles.copy}>
        <div className={styles.text}>
          <p className={`type-label ${styles.eyebrow}`}>{TAGLINE}</p>
          <h1 id="hero-heading" className={`type-display-xl ${styles.headline}`}>
            {HEADLINE}
          </h1>
          <p className={styles.paragraph}>{PARAGRAPH}</p>
        </div>
        <div className={styles.actions}>
          <Link href="/products" className={`type-label ${buttons.primary}`}>
            View products
          </Link>
          <Link href={CONTACT_LINK.href} className={`type-label ${buttons.secondary}`}>
            Contact us
          </Link>
        </div>
      </div>

      <div className={styles.panelFrame}>
        <RegistrationMarks outset />
        <div className={styles.panel}>
          <HeroLinework />
          <div className={styles.imageWrap}>
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              sizes="(min-width: 1024px) 50vw, calc(100vw - 40px)"
              className={styles.image}
              priority
              placeholder={blur ? "blur" : "empty"}
              blurDataURL={blur}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
