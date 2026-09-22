"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { ChevronDownIcon } from "@/components/icons/LineIcons";
import type { NavItem } from "@/lib/site";
import styles from "./NavDropdown.module.css";

const CLOSE_DELAY_MS = 150;

type NavDropdownProps = {
  item: NavItem;
};

/**
 * Primary-nav dropdown (deck slide 4 "PEPTIDES v"), disclosure pattern. Opens on hover, on
 * trigger focus, on click, and on Enter / Space / ArrowDown (which also moves focus into
 * the list). Arrow keys move through the entries, Escape closes and returns focus to the
 * trigger, and leaving the item (focus or pointer) closes it.
 */
export function NavDropdown({ item }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const itemRef = useRef<HTMLLIElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | null>(null);
  const focusFirstOnOpen = useRef(false);
  // Set while focus is returned to the trigger by Escape, so that focus does not reopen it.
  const suppressFocusOpen = useRef(false);
  const children = item.children ?? [];

  const clearCloseTimer = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const openNow = useCallback(() => {
    clearCloseTimer();
    setOpen(true);
  }, []);

  const closeNow = useCallback(() => {
    clearCloseTimer();
    setOpen(false);
  }, []);

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimer.current = window.setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  };

  const links = () =>
    Array.from(itemRef.current?.querySelectorAll<HTMLAnchorElement>("a[href]") ?? []);

  // Focus the first entry when opened from the keyboard.
  useEffect(() => {
    if (open && focusFirstOnOpen.current) {
      focusFirstOnOpen.current = false;
      links()[0]?.focus();
    }
  }, [open]);

  // Close on pointer interaction anywhere else.
  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!itemRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => clearCloseTimer, []);

  const onTriggerFocus = () => {
    if (suppressFocusOpen.current) {
      suppressFocusOpen.current = false;
      return;
    }
    openNow();
  };

  const returnFocusToTrigger = () => {
    suppressFocusOpen.current = true;
    triggerRef.current?.focus();
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      // Handled here; the list-item handler must not advance the focus a second time.
      event.stopPropagation();
      focusFirstOnOpen.current = true;
      if (open) {
        links()[0]?.focus();
      } else {
        openNow();
      }
    }
  };

  const onItemKeyDown = (event: KeyboardEvent<HTMLLIElement>) => {
    if (event.key === "Escape") {
      if (open) {
        event.preventDefault();
        closeNow();
        returnFocusToTrigger();
      }
      return;
    }
    const entries = links();
    const index = entries.indexOf(document.activeElement as HTMLAnchorElement);
    if (index === -1) {
      return;
    }
    let next: number | null = null;
    if (event.key === "ArrowDown") {
      next = index === entries.length - 1 ? 0 : index + 1;
    } else if (event.key === "ArrowUp") {
      next = index === 0 ? entries.length - 1 : index - 1;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = entries.length - 1;
    }
    if (next !== null) {
      event.preventDefault();
      entries[next]?.focus();
    }
  };

  // Close when focus moves to another element outside the item (keyboard users tabbing
  // away). A null relatedTarget is a pointer click in browsers that do not focus buttons
  // or links (Safari); the document pointerdown handler decides those, so a click on an
  // entry still navigates.
  const onItemBlur = (event: FocusEvent<HTMLLIElement>) => {
    const next = event.relatedTarget as Node | null;
    if (next && !itemRef.current?.contains(next)) {
      closeNow();
    }
  };

  return (
    <li
      ref={itemRef}
      className={styles.item}
      data-open={open}
      onMouseEnter={openNow}
      onMouseLeave={scheduleClose}
      onKeyDown={onItemKeyDown}
      onBlur={onItemBlur}
    >
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => (open ? closeNow() : openNow())}
        onFocus={onTriggerFocus}
        onKeyDown={onTriggerKeyDown}
      >
        <span className="type-nav">{item.label}</span>
        <ChevronDownIcon
          size={14}
          className={open ? `${styles.chevron} ${styles.chevronOpen}` : styles.chevron}
        />
      </button>

      <div
        id={panelId}
        className={open ? `${styles.panelWrap} ${styles.panelWrapOpen}` : styles.panelWrap}
      >
        <div className={styles.panel}>
          <ul className={styles.list} aria-label={item.label}>
            {children.map((child) => (
              <li key={`${child.href}-${child.label}`}>
                <Link
                  href={child.href}
                  className={styles.link}
                  tabIndex={open ? undefined : -1}
                  onClick={closeNow}
                >
                  {child.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  );
}
