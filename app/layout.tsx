import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { ResearchUseBand } from "@/components/layout/ResearchUseBand";
import { Footer } from "@/components/layout/Footer";
import { RevealObserver } from "@/components/motion/RevealObserver";
import { SiteJsonLd } from "@/components/seo/SiteJsonLd";
import { DEFAULT_DESCRIPTION, getSiteUrl } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

// Inter throughout (approved design system). Exposed as --font-inter and consumed by
// --kinetus-font-family in app/tokens.css.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

// IBM Plex Mono for data and labels (Phase 6 design language). Exposed as
// --font-plex-mono and consumed by --kinetus-font-mono in app/tokens.css.
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
    <html lang="en-CA" className={`${inter.variable} ${plexMono.variable}`}>
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
