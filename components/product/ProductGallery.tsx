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

/**
 * Gallery — Figma 26:11 (desktop) / 68:170 + 68:172 (mobile).
 * Square media panel on bg/subtle with radius/lg, image contained and never cropped;
 * thumbnail row beneath (hidden when there is a single image). Client component only
 * for the active-thumbnail state.
 */
export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] ?? images[0];

  if (!active) {
    return (
      <div className={styles.gallery}>
        <div
          className={styles.primary}
          aria-label={`${productName}: no image available`}
          role="img"
        />
      </div>
    );
  }

  return (
    <div className={styles.gallery}>
      <div className={styles.primary}>
        <div className={styles.primaryInner}>
          <Image
            key={active.id}
            src={active.url}
            alt={active.altText}
            fill
            sizes="(min-width: 768px) 720px, calc(100vw - 40px)"
            className={styles.image}
            priority={activeIndex === 0}
            placeholder={blurPlaceholder(active.url) ? "blur" : "empty"}
            blurDataURL={blurPlaceholder(active.url)}
          />
        </div>
      </div>

      {images.length > 1 && (
        <ul className={styles.thumbs} aria-label={`${productName} images`}>
          {images.map((image, index) => {
            const isActive = index === activeIndex;
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
                      sizes="(min-width: 768px) 168px, 25vw"
                      className={styles.image}
                      placeholder={blurPlaceholder(image.url) ? "blur" : "empty"}
                      blurDataURL={blurPlaceholder(image.url)}
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
