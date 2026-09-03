import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
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
 * Copy is structural: what the company supplies and how units are identified. The
 * deck's headline, benefit subhead and verification icon row are not reproduced.
 */
const HEADLINE = "Research materials, precisely documented.";
const PARAGRAPH =
  "A Canadian supplier of research materials for the scientific community, academic institutions and independent researchers. Every unit is labelled with a batch reference, and batch-specific documentation is available.";

export function Hero({ imageUrl, imageAlt }: HeroProps) {
  const blur = blurPlaceholder(imageUrl);

  return (
    <Container className={styles.hero} data-reveal="">
      <div className={styles.copy}>
        <div className={styles.text}>
          <p className={`type-label ${styles.eyebrow}`}>{TAGLINE}</p>
          <h1 className={`type-display ${styles.headline}`}>{HEADLINE}</h1>
          <p className={styles.paragraph}>{PARAGRAPH}</p>
        </div>
        <div className={styles.actions}>
          <Link href="/products" className={`type-label ${buttons.primary}`}>
            View products
          </Link>
          <Link
            href={CONTACT_LINK.href}
            prefetch={CONTACT_LINK.prefetch === false ? false : undefined}
            className={`type-label ${buttons.secondary}`}
          >
            Contact us
          </Link>
        </div>
      </div>

      <div className={styles.panel}>
        <HeroLinework />
        <div className={styles.imageWrap}>
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(min-width: 768px) 508px, calc(100vw - 40px)"
            className={styles.image}
            priority
            placeholder={blur ? "blur" : "empty"}
            blurDataURL={blur}
          />
        </div>
      </div>
    </Container>
  );
}
