type SecurityHeadersOptions = {
  nonce: string;
  isDev?: boolean;
};

export function buildContentSecurityPolicy({ nonce, isDev = false }: SecurityHeadersOptions) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'nonce-${nonce}'`,
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://frontend-cdn.perplexity.ai https://vercel.live",
    "connect-src 'self' https://*.supabase.co https://*.vercel.app",
    "media-src 'self'",
    "object-src 'none'",
    "frame-src 'self' https://vercel.live",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

export function buildSecurityHeaders({ nonce, isDev = false }: SecurityHeadersOptions) {
  return {
    "Content-Security-Policy": buildContentSecurityPolicy({ nonce, isDev }),
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "X-XSS-Protection": "1; mode=block",
  } as const;
}
