import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CookieConsentBanner from "@/components/cookie-consent-banner";
import { SITE } from "@/lib/constants";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display-font",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} - Malta's clearest careers platform`,
    template: `%s | ${SITE.name}`,
  },
  description:
    SITE.tagline +
    " Find verified salaries, trusted employers, and direct applications.",
  keywords: [
    "Malta jobs",
    "Malta job board",
    "Malta tech jobs",
    "Malta iGaming jobs",
    "digital roles Malta",
    "jobs in Malta",
    "Malta careers",
    "Malta employment",
  ],
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  publisher: SITE.name,
  openGraph: {
    type: "website",
    locale: "en_MT",
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} - Malta's clearest careers platform`,
    description:
      "A clearer route to Malta's tech, iGaming, and digital careers.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${SITE.name} - Malta's clearest careers platform`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} - Malta's clearest careers platform`,
    description:
      "A clearer route to Malta's tech, iGaming, and digital careers.",
    images: ["/og-image.png"],
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
      { url: "/favicon.ico" },
      { url: "/logo-icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon.png" }],
  },
  manifest: "/manifest.json",
  metadataBase: new URL(SITE.url),
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6EFE7" },
    { media: "(prefers-color-scheme: dark)", color: "#0E1B2E" },
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
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <ThemeProvider>
          <Header />
          <main className="flex-1 pb-[var(--cookie-banner-space,0px)]">{children}</main>
          <Footer />
          <CookieConsentBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}
