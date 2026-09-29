import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter, Roboto_Condensed } from "next/font/google";
import "./globals.css";
import { DEFAULT_DESCRIPTION, defaultShareImage, getSiteUrl } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

// Inter for body, labels and product names. Exposed as --font-inter and consumed by
// --kinetus-font-family in app/tokens.css.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

// Roboto Condensed for the deck's condensed headlines, navigation and buttons.
// Exposed as --font-roboto-condensed and consumed by --kinetus-font-display.
const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-roboto-condensed",
  display: "swap",
});

// IBM Plex Mono is retained for the .type-mono treatment on content pages.
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_CA",
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: [defaultShareImage()],
  },
  twitter: {
    card: "summary",
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * Document shell only: fonts, global styles and the skip link. The public site's chrome
 * lives in app/(site)/layout.tsx and the admin's in app/admin/layout.tsx; both render the
 * <main id="main-content"> the skip link targets. `suppressHydrationWarning` on <html>:
 * the age gate's inline script sets data-age-gate there before React hydrates, so that
 * attribute differs from the server render on purpose.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-CA"
      suppressHydrationWarning
      className={`${inter.variable} ${robotoCondensed.variable} ${plexMono.variable}`}
    >
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
