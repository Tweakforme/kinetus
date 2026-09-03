"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const STAGGER_MS = 60;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Scroll reveal for elements carrying `data-reveal`. Renders nothing.
 *
 * On mount (and after each client navigation) elements already inside the viewport are
 * marked "in" immediately, so nothing visible ever flashes. Elements below the fold are
 * marked "pending" (hidden via CSS) and flipped to "in" as they intersect; siblings that
 * arrive in the same frame are staggered by 60ms. Reduced motion, or no
 * IntersectionObserver, shows everything at once. Without JavaScript nothing is hidden.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (elements.length === 0) {
      return;
    }

    const showAll = () => {
      for (const element of elements) {
        element.dataset.reveal = "in";
      }
    };

    if (window.matchMedia(REDUCED_MOTION_QUERY).matches || !("IntersectionObserver" in window)) {
      showAll();
      return;
    }

    const pending: HTMLElement[] = [];
    const viewportBottom = window.innerHeight;
    for (const element of elements) {
      if (element.dataset.reveal === "in") {
        continue;
      }
      if (element.getBoundingClientRect().top < viewportBottom) {
        element.dataset.reveal = "in";
      } else {
        element.dataset.reveal = "pending";
        pending.push(element);
      }
    }
    if (pending.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const arriving = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        arriving.forEach((entry, index) => {
          const element = entry.target as HTMLElement;
          element.style.transitionDelay = `${index * STAGGER_MS}ms`;
          element.dataset.reveal = "in";
          element.addEventListener(
            "transitionend",
            () => {
              element.style.transitionDelay = "";
            },
            { once: true },
          );
          observer.unobserve(element);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    pending.forEach((element) => observer.observe(element));

    // A fast jump (End key, anchor, flick) can skip past elements without them ever
    // intersecting. Anything that ends up above the viewport is shown outright so nothing
    // is left hidden when the reader scrolls back up.
    let scrollScheduled = false;
    const revealAbove = () => {
      scrollScheduled = false;
      for (const element of pending) {
        if (element.dataset.reveal === "pending" && element.getBoundingClientRect().bottom < 0) {
          element.dataset.reveal = "in";
          observer.unobserve(element);
        }
      }
    };
    const onScroll = () => {
      if (!scrollScheduled) {
        scrollScheduled = true;
        window.requestAnimationFrame(revealAbove);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    const onMotionChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        observer.disconnect();
        showAll();
      }
    };
    mediaQuery.addEventListener("change", onMotionChange);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      mediaQuery.removeEventListener("change", onMotionChange);
    };
  }, [pathname]);

  return null;
}
