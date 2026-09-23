import type { SVGProps } from "react";

/**
 * Thin-line icon set in the deck's language (1.5px strokes, rounded joins, 24-unit grid).
 * Every icon is decorative (aria-hidden) unless a `title` is passed; colour follows
 * `currentColor`. The maple leaf is the one filled shape, as on the deck.
 */
type IconProps = SVGProps<SVGSVGElement> & {
  /** Rendered size in px (width = height). Defaults to 24. */
  size?: number;
  title?: string;
};

function Base({ size = 24, title, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={title ? undefined : "true"}
      role={title ? "img" : undefined}
      focusable="false"
      {...rest}
    >
      {title && <title>{title}</title>}
      {children}
    </svg>
  );
}

export function ShieldCheckIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 3l7 2.8v5.4c0 4.4-3 8.2-7 9.8-4-1.6-7-5.4-7-9.8V5.8L12 3z" />
      <path d="M9 12.2l2.1 2.1L15.3 10" />
    </Base>
  );
}

export function CogIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.5 1.5M17.2 17.2l1.5 1.5M5.3 18.7l1.5-1.5M17.2 6.8l1.5-1.5" />
      <path d="M12 6.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11z" />
    </Base>
  );
}

export function MicroscopeIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M6 21h12M9 21v-3M14 21v-3" />
      <path d="M9 18h6a5 5 0 0 0 1.2-9.8" />
      <path d="M10.2 3.6l3.8 2.2-4 6.9-3.8-2.2z" />
      <path d="M8.5 11.5l-1 1.8M12 3.2l1-.7 1.4 2.4-1 .6" />
      <path d="M4 15h6" />
    </Base>
  );
}

export function FlaskIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M9.5 3h5M10 3v6.2L4.8 18a2 2 0 0 0 1.7 3h11a2 2 0 0 0 1.7-3L14 9.2V3" />
      <path d="M7.5 14.5h9" />
    </Base>
  );
}

export function TruckIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M2.5 6.5h11v9h-11z" />
      <path d="M13.5 9.5h4l3 3.2v2.8h-7" />
      <circle cx="6.5" cy="17.5" r="1.8" />
      <circle cx="16.5" cy="17.5" r="1.8" />
      <path d="M2.5 12.5h4M2.5 9.5h6" />
    </Base>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
      <circle cx="12" cy="15.5" r="1.2" />
    </Base>
  );
}

export function DocumentIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v4h4M9.5 12h5M9.5 15.5h5M9.5 8.5h2" />
    </Base>
  );
}

export function ClipboardCheckIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="5.5" y="4.5" width="13" height="16.5" rx="1.5" />
      <path d="M9 4.5V3h6v1.5M9 3h6" />
      <path d="M8.5 13l2.2 2.2 4.8-4.8" />
    </Base>
  );
}

export function MoleculeIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="2" />
      <circle cx="5" cy="7" r="1.6" />
      <circle cx="19" cy="7" r="1.6" />
      <circle cx="5" cy="17" r="1.6" />
      <circle cx="19" cy="17" r="1.6" />
      <path d="M10.4 10.8L6.3 8M13.6 10.8l4.1-2.8M10.4 13.2L6.3 16M13.6 13.2l4.1 2.8" />
    </Base>
  );
}

export function HexagonIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 3l7.8 4.5v9L12 21l-7.8-4.5v-9z" />
      <circle cx="12" cy="3" r="1" fill="currentColor" stroke="none" />
      <circle cx="19.8" cy="7.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="19.8" cy="16.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="21" r="1" fill="currentColor" stroke="none" />
      <circle cx="4.2" cy="16.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="4.2" cy="7.5" r="1" fill="currentColor" stroke="none" />
    </Base>
  );
}

export function VialIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M8.5 3h7M9.5 3v2.5h5V3" />
      <path d="M9.5 5.5v1.8a2 2 0 0 1-1 1.7 2.4 2.4 0 0 0-1 2v8a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2v-8a2.4 2.4 0 0 0-1-2 2 2 0 0 1-1-1.7V5.5" />
      <path d="M7.5 13h9" />
    </Base>
  );
}

export function BoxIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 3l8 4v10l-8 4-8-4V7z" />
      <path d="M4 7l8 4 8-4M12 11v10" />
    </Base>
  );
}

export function SnowflakeIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 2.5v19M3.8 7.3l16.4 9.4M3.8 16.7l16.4-9.4" />
      <path d="M12 2.5l-2.2 2.2M12 2.5l2.2 2.2M12 21.5l-2.2-2.2M12 21.5l2.2-2.2M3.8 7.3l3 .3M3.8 7.3l.3 3M20.2 16.7l-3-.3M20.2 16.7l-.3-3M3.8 16.7l3-.3M3.8 16.7l.3-3M20.2 7.3l-3 .3M20.2 7.3l-.3 3" />
    </Base>
  );
}

export function PeakIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M3 19h18" />
      <path d="M4 17l3-3.5 2 2 2.3-7.5L14 17l2-4 1.5 2.4L20 12" />
    </Base>
  );
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.5 12.2l2.3 2.3 4.7-4.8" />
    </Base>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l5 5" />
    </Base>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
    </Base>
  );
}

export function EnvelopeIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="M3.5 7l8.5 6 8.5-6" />
    </Base>
  );
}

export function CartIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M2.5 4h2.6l2.3 10.6a1.5 1.5 0 0 0 1.5 1.2h8.4a1.5 1.5 0 0 0 1.5-1.1L20.8 8H6.3" />
      <circle cx="9.5" cy="19.5" r="1.3" />
      <circle cx="17" cy="19.5" r="1.3" />
    </Base>
  );
}

export function MinusIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M5 12h14" />
    </Base>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 5v14M5 12h14" />
    </Base>
  );
}

export function HeadsetIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
      <rect x="3" y="12.5" width="4" height="6" rx="1.5" />
      <rect x="17" y="12.5" width="4" height="6" rx="1.5" />
      <path d="M19 18.5v1a2 2 0 0 1-2 2h-3" />
    </Base>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M6 9l6 6 6-6" />
    </Base>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M15 5l-7 7 7 7" />
    </Base>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M9 5l7 7-7 7" />
    </Base>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 12h15M13 6l6 6-6 6" />
    </Base>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Base>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Base>
  );
}

export function DropletIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11z" />
    </Base>
  );
}

export function TagIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M3.5 12.5V4.5h8l9 9-8 8z" />
      <circle cx="7.5" cy="8.5" r="1.3" />
    </Base>
  );
}

export function BookIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 6.5c-1.5-1.3-3.8-2-7.5-2v13c3.7 0 6 .7 7.5 2 1.5-1.3 3.8-2 7.5-2v-13c-3.7 0-6 .7-7.5 2z" />
      <path d="M12 6.5v13" />
    </Base>
  );
}

export function ScaleIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 3v18M5 21h14M4 7h16" />
      <path d="M7 7l-3 7a3 3 0 0 0 6 0zM17 7l-3 7a3 3 0 0 0 6 0z" />
    </Base>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5M12 8v.5" />
    </Base>
  );
}

export function GlobeIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.5 2.6 3.8 5.4 3.8 8.5s-1.3 5.9-3.8 8.5c-2.5-2.6-3.8-5.4-3.8-8.5S9.5 6.1 12 3.5z" />
    </Base>
  );
}

/** Filled maple leaf (the deck's red accent). */
export function MapleLeafIcon({ size = 24, title, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={title ? undefined : "true"}
      role={title ? "img" : undefined}
      focusable="false"
      {...rest}
    >
      {title && <title>{title}</title>}
      {/*
       * Eleven-point maple leaf: stem, three lobes each side, notched silhouette.
       * Drawn as one path so it stays readable from 16px (footer, dividers) to 64px.
       */}
      <path d="M12 21.8v-3.6l-4.5.8.6-2.05-4.9-3.85 1.1-.5-.8-3 2.85.6.72-1.6 2.66 2.86-1-5.02 1.58.9L12 2.2l1.69 5.14 1.58-.9-1 5.02 2.66-2.86.72 1.6 2.85-.6-.8 3 1.1.5-4.9 3.85.6 2.05-4.5-.8v3.6z" />
    </svg>
  );
}
