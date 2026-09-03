"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Container } from "./Container";
import { ResearchUseStrip } from "./ResearchUseStrip";
import { CloseIcon } from "@/components/icons/CloseIcon";
import { MenuIcon } from "@/components/icons/MenuIcon";
import { RESEARCH_USE_COPY, SITE_NAME, type NavLink } from "@/lib/site";
import styles from "./MobileNav.module.css";

const DESKTOP_MEDIA_QUERY = "(min-width: 768px)";

type MobileNavProps = {
  links: NavLink[];
};

/**
 * Mobile navigation: 48×48 menu trigger + full-screen drawer, matching the approved
 * "Mobile Navigation — Open State" frame (55:8): top bar mirrors the header with a
 * close trigger in the same position, stacked nav items with subtle rules, and a
 * bottom block (rule · contact · research-use line).
 *
 * The Figma frame shows an expandable "Products" submenu listing MOCK collections;
 * no collections exist yet, so the submenu is deferred to the phase that builds them.
 */
export function MobileNav({ links }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const drawerId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // While open: lock body scroll, move focus into the drawer, close on Escape, and close
  // if the viewport grows to desktop. On close, restore focus to the menu trigger.
  useEffect(() => {
    if (!open) {
      return;
    }
    const toggle = toggleRef.current;
    document.body.classList.add("nav-open");
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const onMediaChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    mediaQuery.addEventListener("change", onMediaChange);

    return () => {
      document.body.classList.remove("nav-open");
      document.removeEventListener("keydown", onKeyDown);
      mediaQuery.removeEventListener("change", onMediaChange);
      toggle?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls={drawerId}
        aria-label="Open menu"
        onClick={() => setOpen(true)}
      >
        <MenuIcon />
      </button>

      <div
        id={drawerId}
        className={open ? `${styles.drawer} ${styles.drawerOpen}` : styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        inert={!open}
      >
        <div className={styles.top}>
          <ResearchUseStrip />
          <div className={styles.topBar}>
            <Container className={styles.topRow}>
              <Link
                href="/"
                className={styles.logoLink}
                aria-label={`${SITE_NAME} home`}
                onClick={close}
              >
                <Image
                  src="/kinetus-logo.png"
                  alt={SITE_NAME}
                  width={1515}
                  height={1038}
                  sizes="70px"
                  className={styles.logo}
                />
              </Link>
              <button
                ref={closeRef}
                type="button"
                className={styles.close}
                aria-label="Close menu"
                onClick={close}
              >
                <CloseIcon />
              </button>
            </Container>
          </div>

          <Container as="nav" className={styles.body} aria-label="Mobile primary">
            <ul className={styles.list}>
              {links.map((link) => (
                <li key={link.href} className={styles.item}>
                  <Link href={link.href} className={`type-h3 ${styles.link}`} onClick={close}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </div>

        <div className={styles.bottom}>
          <Container className={styles.bottomInner}>
            <hr className={styles.rule} />
            {/* TODO: confirm public contact info with AJ/Mike — the approved frame shows an
                email and phone number here. Nothing is rendered until they are confirmed. */}
            <p className={`type-caption ${styles.caption}`}>{RESEARCH_USE_COPY}</p>
          </Container>
        </div>
      </div>
    </>
  );
}
