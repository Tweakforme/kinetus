"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { CloseIcon, MinusIcon, PlusIcon } from "@/components/icons/LineIcons";
import styles from "./InformationSheetDialog.module.css";

type InformationSheetDialogProps = {
  open: boolean;
  /** Runs however the viewer was closed (button or Escape). */
  onClose: () => void;
  productName: string;
  sheet: { url: string; alt: string };
};

type ImageState = "loading" | "ready" | "failed";

/** A point on the sheet, as fractions of its width and height, and where it sat on screen. */
type ZoomAnchor = { fx: number; fy: number; x: number; y: number };

/**
 * Full-screen viewer for a product information sheet: a native modal dialog (the page
 * behind is inert and does not scroll), Escape or the 48px close button closes it, Tab
 * stays inside it, and focus returns to the button that opened it. The sheet opens fitted
 * to the screen; Zoom in (or a click or tap on the sheet) shows it at full size, scrolled
 * so the point clicked stays under the pointer. Pinch zoom is never blocked, the sheet
 * area scrolls in both directions (also with the arrow keys once focused), and the file
 * can be opened on its own in a new tab. The full-resolution file is loaded only when the
 * viewer first opens.
 */
export function InformationSheetDialog({
  open,
  onClose,
  productName,
  sheet,
}: InformationSheetDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const anchorRef = useRef<ZoomAnchor | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const [imageState, setImageState] = useState<ImageState>("loading");
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
      closeRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // After a zoom change, place the sheet: full size keeps the anchor point where it was on
  // screen; fitted goes back to the top.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }
    const anchor = anchorRef.current;
    anchorRef.current = null;
    const image = viewport.querySelector("img");
    if (!zoomed || !image) {
      viewport.scrollTo({ left: 0, top: 0, behavior: "instant" });
      return;
    }
    const box = viewport.getBoundingClientRect();
    const target = anchor ?? { fx: 0.5, fy: 0.5, x: box.width / 2, y: box.height / 2 };
    viewport.scrollTo({
      left: image.offsetLeft + target.fx * image.offsetWidth - target.x,
      top: image.offsetTop + target.fy * image.offsetHeight - target.y,
      behavior: "instant",
    });
  }, [zoomed]);

  const toggleZoomAt = (event: MouseEvent<HTMLImageElement>) => {
    const image = event.currentTarget.getBoundingClientRect();
    const box = viewportRef.current?.getBoundingClientRect();
    if (box && image.width > 0 && image.height > 0) {
      anchorRef.current = {
        fx: (event.clientX - image.left) / image.width,
        fy: (event.clientY - image.top) / image.height,
        x: event.clientX - box.left,
        y: event.clientY - box.top,
      };
    }
    setZoomed((value) => !value);
  };

  // The next opening starts fitted, and waits for the sheet again.
  const handleClose = () => {
    setZoomed(false);
    setImageState("loading");
    onClose();
  };

  // Tab and Shift+Tab cycle through the viewer's own controls.
  const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== "Tab" || !dialogRef.current) {
      return;
    }
    const focusable = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), [tabindex='0']",
      ),
    ).filter((element) => element.getClientRects().length > 0);
    if (focusable.length === 0) {
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

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      onClose={handleClose}
      onKeyDown={onKeyDown}
    >
      {open && (
        <div className={styles.frame}>
          <div className={styles.bar}>
            <h2 id={titleId} className={styles.title}>
              <span className={styles.eyebrow}>Product information</span>{" "}
              <span className={styles.name}>{productName}</span>
            </h2>
            <div className={styles.tools}>
              <button
                type="button"
                className={styles.tool}
                onClick={() => setZoomed((value) => !value)}
                disabled={imageState !== "ready"}
              >
                {zoomed ? <MinusIcon size={20} /> : <PlusIcon size={20} />}
                {zoomed ? "Fit to screen" : "Zoom in"}
              </button>
              <a href={sheet.url} target="_blank" rel="noopener noreferrer" className={styles.tool}>
                Open in new tab
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            </div>
            <button
              ref={closeRef}
              type="button"
              className={styles.close}
              aria-label="Close product information"
              onClick={() => dialogRef.current?.close()}
            >
              <CloseIcon size={26} />
            </button>
          </div>

          <div
            ref={viewportRef}
            className={zoomed ? `${styles.viewport} ${styles.zoomed}` : styles.viewport}
            role="region"
            aria-label="Information sheet. Scroll to move around the sheet."
            tabIndex={0}
          >
            {imageState !== "ready" && (
              <p className={styles.status} role="status">
                {imageState === "failed"
                  ? "The sheet could not be shown here. Use Open in new tab to view it."
                  : "Loading the sheet"}
              </p>
            )}
            {/* The original file, not a resized copy: zooming needs every pixel. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sheet.url}
              alt={sheet.alt}
              className={styles.image}
              data-state={imageState}
              decoding="async"
              onLoad={() => setImageState("ready")}
              onError={() => setImageState("failed")}
              onClick={imageState === "ready" ? toggleZoomAt : undefined}
            />
          </div>
          {imageState === "ready" && !zoomed && (
            <p className={styles.hint}>Tap the sheet or use Zoom in to read the small print.</p>
          )}
        </div>
      )}
    </dialog>
  );
}
