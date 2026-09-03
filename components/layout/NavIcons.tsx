import type { SVGProps } from "react";

/**
 * Exact 10×10 chevron from the approved Figma navigation (node 38:53). Only change from
 * the export: stroke colour is `currentColor` so it follows the trigger's colour token.
 */
export function ChevronIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        d="M2 4L5 7L8 4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
