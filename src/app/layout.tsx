import type { Metadata } from "next";
import { Barlow, Inter, Manrope, Baloo_2 } from "next/font/google";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CookieConsentBanner from "@/components/cookie-consent-banner";
import { SITE } from "@/lib/constants";

export const dynamic = "force-dynamic";

// Thick, modern display face for headlines.
const barlow = Barlow({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-barlow",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

// Rounded, friendly display face used for the impjieg.work logo wordmark.
const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-logo",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: SITE.title,
    template: "%s | Impjieg",
  },
  description: SITE.description,
  keywords: [
    "Malta jobs marketplace",
    "tech jobs Malta",
    "iGaming careers Malta",
    "digital jobs Malta",
    "Malta hiring platform",
    "salary signals Malta",
    "work mode clarity Malta",
  ],
  authors: [{ name: "Impjieg" }],
  creator: "Impjieg",
  publisher: "Impjieg",
  openGraph: {
    type: "website",
    locale: "en_MT",
    url: SITE.url,
    siteName: "Impjieg",
    title: SITE.title,
    description: SITE.description,
    // Images come from the file-based opengraph-image.tsx routes (branded,
    // per-page). The root app/opengraph-image.tsx provides the default.
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
    // twitter:image is generated from the opengraph-image.tsx routes.
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/logo-icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
  },
  manifest: "/manifest.webmanifest",
  metadataBase: new URL(SITE.url),
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFBED" },
    { media: "(prefers-color-scheme: dark)", color: "#14110D" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${barlow.variable} ${inter.variable} ${manrope.variable} ${baloo.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <ThemeProvider>
          <a href="#main-content" className="skip-to-content">Skip to main content</a>
          <Header />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
          <CookieConsentBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}
