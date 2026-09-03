"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Container } from "./Container";
import { ChevronIcon } from "./NavIcons";
import { UtilityBar } from "./UtilityBar";
import logo from "@/public/kinetus-logo.png";
import { CloseIcon } from "@/components/icons/CloseIcon";
import { MenuIcon } from "@/components/icons/MenuIcon";
import { RESEARCH_USE_COPY, SITE_NAME, type NavItem } from "@/lib/site";
import styles from "./MobileNav.module.css";

const DESKTOP_MEDIA_QUERY = "(min-width: 768px)";

type MobileNavProps = {
  items: NavItem[];
  /** Shown above the desktop breakpoint too, when the desktop nav would overflow. */
  forceVisible?: boolean;
};

/**
 * Mobile navigation: 48×48 menu trigger + full-screen drawer, matching the approved
 * "Mobile Navigation — Open State" frame (55:8): top bar mirrors the header with a
 * close trigger in the same position, stacked rows with subtle rules, and a bottom
 * block (rule · research-use line). Collections are accordion rows listing their products
 * (Figma 71:210 submenu treatment); Contact is a plain row. Focus is trapped inside the
 * drawer while open, body scroll is locked, Escape closes, and focus returns to the trigger.
 */
export function MobileNav({ items, forceVisible = false }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const drawerId = useId();
  const drawerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // While open: lock body scroll, move focus into the drawer, close on Escape, and close
  // if the viewport grows to desktop (unless the desktop nav has collapsed into us).
  // On close, restore focus to the menu trigger.
  useEffect(() => {
    if (!open) {
      return;
    }
    const toggle = toggleRef.current;
    document.body.classList.add("nav-open");
    closeRef.current?.focus();

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const onMediaChange = (event: MediaQueryListEvent) => {
      if (event.matches && !forceVisible) {
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
  }, [open, forceVisible]);

  // Focus trap: Tab and Shift+Tab cycle within the drawer's visible controls.
  const onDrawerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !drawerRef.current) {
      return;
    }
    const focusable = Array.from(
      drawerRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
    ).filter((element) => !element.closest("[inert]") && element.getClientRects().length > 0);
    if (focusable.length === 0) {
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const toggleClass = forceVisible ? `${styles.toggle} ${styles.forced}` : styles.toggle;
  const drawerClass = [
    styles.drawer,
    open ? styles.drawerOpen : "",
    forceVisible ? styles.forced : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        className={toggleClass}
        aria-expanded={open}
        aria-controls={drawerId}
        aria-label="Open menu"
        onClick={() => setOpen(true)}
      >
        <MenuIcon />
      </button>

      <div
        ref={drawerRef}
        id={drawerId}
        className={drawerClass}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        inert={!open}
        onKeyDown={onDrawerKeyDown}
      >
        <div className={styles.top}>
          <UtilityBar />
          <div className={styles.topBar}>
            <Container className={styles.topRow}>
              <Link
                href="/"
                className={styles.logoLink}
                aria-label={`${SITE_NAME} home`}
                onClick={close}
              >
                <Image
                  src={logo}
                  alt={SITE_NAME}
                  sizes="70px"
                  className={styles.logo}
                  placeholder="blur"
                  loading="eager"
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
              {items.map((item) => {
                if (!item.children) {
                  return (
                    <li key={item.href} className={styles.item}>
                      <Link
                        href={item.href}
                        prefetch={item.prefetch === false ? false : undefined}
                        className={`type-h3 ${styles.link}`}
                        onClick={close}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                }

                const isExpanded = expanded === item.href;
                const subId = `${drawerId}-${item.href.replace(/[^a-z0-9]+/gi, "-")}`;
                return (
                  <li key={item.href} className={styles.item}>
                    <button
                      type="button"
                      className={`type-h3 ${styles.row}`}
                      aria-expanded={isExpanded}
                      aria-controls={subId}
                      onClick={() => setExpanded(isExpanded ? null : item.href)}
                    >
                      <span>{item.label}</span>
                      <ChevronIcon
                        className={
                          isExpanded
                            ? `${styles.rowChevron} ${styles.rowChevronOpen}`
                            : styles.rowChevron
                        }
                      />
                    </button>
                    <div
                      id={subId}
                      className={isExpanded ? `${styles.sub} ${styles.subOpen}` : styles.sub}
                      inert={!isExpanded}
                    >
                      <div className={styles.subInner}>
                        <ul className={styles.subList}>
                          {item.children.map((child, index) => {
                            const isViewAll = index === item.children!.length - 1;
                            return (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  className={
                                    isViewAll
                                      ? `type-label ${styles.subLink} ${styles.subViewAll}`
                                      : `type-body ${styles.subLink}`
                                  }
                                  aria-label={
                                    isViewAll ? `${child.label} ${item.label}` : undefined
                                  }
                                  onClick={close}
                                >
                                  {child.label}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  </li>
                );
              })}
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
