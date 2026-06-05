import type { NextConfig } from "next";

export const securityHeaders = [
  {
    source: "/:path*",
    headers: [
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          "base-uri 'self'",
          "frame-ancestors 'self'",
          "form-action 'self' https://checkout.stripe.com",
          "object-src 'none'",
          "img-src 'self' data: https://*.supabase.co https://*.stripe.com",
          "font-src 'self' data:",
          "style-src 'self' 'unsafe-inline'",
          "script-src 'self' 'unsafe-inline'",
          "connect-src 'self' https://*.supabase.co https://api.groq.com https://api.resend.com https://api.stripe.com https://*.stripe.com",
        ].join("; "),
      },
      {
        key: "X-DNS-Prefetch-Control",
        value: "on",
      },
      {
        key: "X-Frame-Options",
        value: "SAMEORIGIN",
      },
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "Referrer-Policy",
        value: "origin-when-cross-origin",
      },
    ],
  },
] as const;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
  async headers() {
    return securityHeaders;
  },
};

export default nextConfig;
