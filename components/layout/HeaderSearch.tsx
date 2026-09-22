"use client";

import { useEffect, useId, useRef, useState, type FocusEvent } from "react";
import { SearchIcon } from "@/components/icons/LineIcons";
import { HEADER_ICON_LINKS } from "@/lib/site";
import styles from "./HeaderSearch.module.css";

/**
 * Header search: the search icon toggles a small panel under the header holding a plain
 * form that submits GET /search?q=. Focus moves into the field on open; Escape closes the
 * panel and returns focus to the icon; a pointer or focus anywhere else closes it. There is
 * no client-side fetching: the search page does the work.
 */
export function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelId = useId();
  const inputId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }
    inputRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  // Close when focus moves to another element outside the panel (keyboard users tabbing
  // away). A null relatedTarget is a pointer click in browsers that do not focus buttons
  // (Safari); the document pointerdown handler decides those, so the click still lands.
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (next && !rootRef.current?.contains(next)) {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className={styles.root} onBlur={onBlur}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <SearchIcon size={26} />
        <span className="visually-hidden">{HEADER_ICON_LINKS.search.label}</span>
      </button>

      <div
        id={panelId}
        className={open ? `${styles.panel} ${styles.panelOpen}` : styles.panel}
        inert={!open}
      >
        <form
          action={HEADER_ICON_LINKS.search.href}
          method="get"
          role="search"
          className={styles.form}
        >
          <label htmlFor={inputId} className="visually-hidden">
            Search the catalogue
          </label>
          <input
            ref={inputRef}
            id={inputId}
            type="search"
            name="q"
            className={styles.input}
            placeholder="Search products"
            autoComplete="off"
            enterKeyHint="search"
          />
          <button type="submit" className={styles.submit}>
            Search
          </button>
        </form>
      </div>
    </div>
  );
}
