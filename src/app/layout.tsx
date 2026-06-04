import type { Metadata } from "next";
import { Fraunces, Manrope, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
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
    default: "Impjieg - Malta's transparent job board",
    template: "%s | Impjieg",
  },
  description:
    "Malta's transparent job board for verified salaries, fresh listings, and direct applications. Hire with clarity and reach candidates faster.",
  keywords: [
    "Malta jobs",
    "Malta job board",
    "jobs in Malta",
    "Malta careers",
    "salary transparency",
    "Malta employment",
  ],
  authors: [{ name: "Impjieg" }],
  creator: "Impjieg",
  publisher: "Impjieg",
  openGraph: {
    type: "website",
    locale: "en_MT",
    url: "https://impjieg.vercel.app",
    siteName: "Impjieg",
    title: "Impjieg - Malta's transparent job board",
    description:
      "Verified salaries, direct applications, and fresh listings for Malta's job market.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Impjieg - Malta's transparent job board",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Impjieg - Malta's transparent job board",
    description:
      "Verified salaries, direct applications, and fresh listings for Malta.",
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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_URL || "https://impjieg.vercel.app"
  ),
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F1E8" },
    { media: "(prefers-color-scheme: dark)", color: "#07111D" },
  ],
};

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CookieConsentBanner from "@/components/cookie-consent-banner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${fraunces.variable} ${jetbrainsMono.variable} h-full antialiased`}
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
