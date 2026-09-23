"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import buttons from "@/components/ui/buttons.module.css";
import {
  AGE_COOKIE,
  AGE_COOKIE_MAX_AGE,
  AGE_GATE_ATTRIBUTE,
  SITE_CONTENT_ID,
} from "@/lib/age-gate";
import { PACKAGING, SITE_NAME } from "@/lib/site";
import styles from "./AgeGate.module.css";

const LOGO = { src: "/brand/kinetus-logo-horizontal-white.png", width: 236, height: 56 };

function isShown(): boolean {
  return document.documentElement.getAttribute(AGE_GATE_ATTRIBUTE) === "show";
}

/**
 * The age verification overlay (client mockup "Qualification Page", restyled on the
 * navy ground). Server-rendered hidden; shown by AGE_GATE_SCRIPT (lib/age-gate.ts) through CSS. While shown
 * the page behind it is inert, the body does not scroll, Tab stays inside the dialog and
 * Escape does nothing. Yes stores the cookie and dismisses; No replaces the dialog with a
 * short message and leaves the site unreachable (nothing is stored, so a later visit asks
 * again). The mockup's "A HEALTHIER TOMORROW" line is a benefit claim and is left out.
 */
export function AgeGate() {
  const [denied, setDenied] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const yesRef = useRef<HTMLButtonElement>(null);
  const headingId = useId();
  const bodyId = useId();

  useEffect(() => {
    if (!isShown()) {
      return;
    }
    const content = document.getElementById(SITE_CONTENT_ID);
    content?.setAttribute("inert", "");
    (yesRef.current ?? dialogRef.current)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (!isShown()) {
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }
      const focusable = [
        ...dialogRef.current.querySelectorAll<HTMLElement>("button:not([disabled])"),
      ];
      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !dialogRef.current.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !dialogRef.current.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, []);

  useEffect(() => {
    if (denied) {
      dialogRef.current?.focus();
    }
  }, [denied]);

  const confirm = () => {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${AGE_COOKIE}=1; Max-Age=${AGE_COOKIE_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
    document.documentElement.removeAttribute(AGE_GATE_ATTRIBUTE);
    document.getElementById(SITE_CONTENT_ID)?.removeAttribute("inert");
  };

  return (
    <div id="age-gate" className={styles.gate}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        aria-describedby={bodyId}
        tabIndex={-1}
      >
        <Image
          src={LOGO.src}
          alt={SITE_NAME}
          width={LOGO.width}
          height={LOGO.height}
          className={styles.logo}
        />
        <p className={styles.tagline}>{PACKAGING.tagline}</p>

        <svg className={styles.mark} viewBox="0 0 96 96" aria-hidden="true" focusable="false">
          <circle cx="48" cy="48" r="44" fill="none" stroke="currentColor" strokeWidth="4" />
          {/* The slash stops short of the digits on both sides, so "18" stays legible. */}
          <path d="M17 79 L31 65 M65 31 L79 17" stroke="currentColor" strokeWidth="4" />
          <text
            x="48"
            y="60"
            textAnchor="middle"
            fontSize="36"
            fontWeight="700"
            fill="currentColor"
            fontFamily="var(--kinetus-font-display)"
          >
            18
          </text>
        </svg>

        <h2 id={headingId} className={styles.heading}>
          Age verification <span className={styles.headingAccent}>required</span>
        </h2>

        {denied ? (
          <div id={bodyId} className={styles.body} role="status">
            <p>This website is only available to visitors aged 18 or older.</p>
            <p>You cannot access this site.</p>
          </div>
        ) : (
          <>
            <div id={bodyId} className={styles.body}>
              <p>You must be 18 years or older to access this website.</p>
              <p>Please verify your age to continue browsing our products.</p>
            </div>
            <div className={styles.actions}>
              <button
                ref={yesRef}
                type="button"
                className={`${buttons.solid} ${styles.button}`}
                onClick={confirm}
              >
                Yes, I&apos;m 18 or older
              </button>
              <button
                type="button"
                className={`${buttons.outline} ${buttons.outlineOnDark} ${styles.button}`}
                onClick={() => setDenied(true)}
              >
                No, I&apos;m under 18
              </button>
            </div>
          </>
        )}

        <p className={styles.footnote}>{PACKAGING.researchUseOnly}</p>
      </div>
    </div>
  );
}
