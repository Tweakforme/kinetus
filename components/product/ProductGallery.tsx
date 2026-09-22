"use client";

import Image from "next/image";
import { useState } from "react";
import { blurPlaceholder } from "@/lib/images";
import styles from "./ProductGallery.module.css";

export type GalleryImage = {
  id: string;
  url: string;
  altText: string;
};

type ProductGalleryProps = {
  images: GalleryImage[];
  productName: string;
};

/** Keyed renders (transparent PNG) take the drop shadow; opaque photographs do not. */
function isKeyedRender(url: string): boolean {
  return /\.png(?:[?#].*)?$/i.test(url);
}

/**
 * The render column of the product hero (deck slide 9): the primary image large,
 * floating on the white page with no panel behind it, thumbnails beneath only when the
 * product has more than one image. Client component only for the active-thumbnail state.
 */
export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] ?? images[0];

  if (!active) {
    return (
      <div className={styles.gallery}>
        <div
          className={styles.stage}
          role="img"
          aria-label={`${productName}: no image available`}
        />
      </div>
    );
  }

  const activeBlur = blurPlaceholder(active.url);
  const imageClass = isKeyedRender(active.url)
    ? `${styles.image} ${styles.imageKeyed}`
    : styles.image;

  return (
    <div className={styles.gallery}>
      <div className={styles.stage}>
        <Image
          key={active.id}
          src={active.url}
          alt={active.altText}
          fill
          sizes="(min-width: 1024px) 40vw, (min-width: 768px) 50vw, 100vw"
          className={imageClass}
          priority={activeIndex === 0}
          placeholder={activeBlur ? "blur" : "empty"}
          blurDataURL={activeBlur}
        />
      </div>

      {images.length > 1 && (
        <ul className={styles.thumbs} aria-label={`${productName} images`}>
          {images.map((image, index) => {
            const isActive = index === activeIndex;
            const blur = blurPlaceholder(image.url);
            return (
              <li key={image.id} className={styles.thumbItem}>
                <button
                  type="button"
                  className={isActive ? `${styles.thumb} ${styles.thumbActive}` : styles.thumb}
                  aria-pressed={isActive}
                  aria-label={`Show image ${index + 1} of ${images.length}: ${image.altText}`}
                  onClick={() => setActiveIndex(index)}
                >
                  <span className={styles.thumbInner}>
                    <Image
                      src={image.url}
                      alt=""
                      fill
                      sizes="64px"
                      className={styles.thumbImage}
                      placeholder={blur ? "blur" : "empty"}
                      blurDataURL={blur}
                    />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
