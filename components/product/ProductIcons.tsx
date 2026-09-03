import type { SVGProps } from "react";

/**
 * Exact 20×20 vectors exported from the approved Figma product detail frames.
 * Only change from the exports: stroke colour is `currentColor` so each icon follows
 * the colour token of its context.
 */

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ children, ...props }: IconProps) {
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
      {children}
    </svg>
  );
}

/** Figma node 27:30 — shield with check ("Lab verified purity & potency"). */
export function ShieldCheckIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path
        d="M10 2.5L16 4.5V9.5C16 13.5 13.5 16.2 10 17.5C6.5 16.2 4 13.5 4 9.5V4.5L10 2.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M7.4 9.8L9.2 11.6L12.7 8.1"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

/** Figma node 27:35 — flask ("Third-party tested"). */
export function FlaskIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path
        d="M8 3.2H11.2V8.6H8V3.2Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M9.6 8.6C7 8.6 4.9 10.7 4.9 13.3H14.3C14.3 10.7 12.2 8.6 9.6 8.6Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M3.4 16.6H16.6M13 5.2H15.2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </IconBase>
  );
}

/** Figma node 27:41 — hexagon ("Research grade material"). */
export function HexagonIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path
        d="M10 2.4L16.6 6.2V13.8L10 17.6L3.4 13.8V6.2L10 2.4Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}

/** Figma node 29:12 — document. */
export function DocumentIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path
        d="M11.5 2.6H5.6V17.4H14.4V5.5L11.5 2.6Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M11.5 2.6V5.5H14.4" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path
        d="M8 10.4H12M8 13.2H12"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </IconBase>
  );
}

/** Figma node 29:25 — download. */
export function DownloadIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path
        d="M10 3.2V11.8M6.9 8.7L10 11.8L13.1 8.7"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.2 14.2V15.8H15.8V14.2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
}
