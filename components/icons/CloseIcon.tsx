import type { SVGProps } from "react";

/**
 * Exact vector from the approved Figma file (node 71:203, close trigger, 20×20).
 * Only change from the export: stroke colour is `currentColor` so it follows the
 * text token instead of a hard-coded hex.
 */
export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        d="M5 5L15 15M15 5L5 15"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
