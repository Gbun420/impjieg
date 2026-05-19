import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  variable: "--font-inter",
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
    default: "Impjieg — Malta's Job Board | Your Next Role, Sorted",
    template: "%s | Impjieg",
  },
  description:
    "Malta's modern job board with salary transparency. Find verified salaries, direct applications, and fresh listings. Hiring? Post your job in minutes.",
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
    url: "https://impjieg.com",
    siteName: "Impjieg",
    title: "Impjieg — Malta's Job Board",
    description:
      "Malta's modern job board with salary transparency. Find verified salaries and fresh listings.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Impjieg — Malta's Job Board",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Impjieg — Malta's Job Board",
    description:
      "Malta's modern job board with salary transparency.",
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
    process.env.NEXT_PUBLIC_URL || "https://impjieg.com"
  ),
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF8FF" },
    { media: "(prefers-color-scheme: dark)", color: "#0F0B1A" },
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
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CookieConsentBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}
