import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter, Roboto_Condensed } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { ResearchUseBand } from "@/components/layout/ResearchUseBand";
import { Footer } from "@/components/layout/Footer";
import { RevealObserver } from "@/components/motion/RevealObserver";
import { SiteJsonLd } from "@/components/seo/SiteJsonLd";
import { DEFAULT_DESCRIPTION, getSiteUrl } from "@/lib/seo";
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
    images: [{ url: "/kinetus-logo.png", width: 1515, height: 1038, alt: SITE_NAME }],
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-CA"
      className={`${inter.variable} ${robotoCondensed.variable} ${plexMono.variable}`}
    >
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Header />
        <main id="main-content">{children}</main>
        <ResearchUseBand />
        <Footer />
        <SiteJsonLd />
        <RevealObserver />
      </body>
    </html>
  );
}
