type SecurityHeadersOptions = {
  nonce: string;
  isDev?: boolean;
};

export function buildContentSecurityPolicy({ nonce, isDev = false }: SecurityHeadersOptions) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://vercel.live${isDev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'nonce-${nonce}' https://vercel.live`,
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data: blob: https: https://vercel.live https://vercel.com",
    "font-src 'self' data: https://frontend-cdn.perplexity.ai https://vercel.live https://assets.vercel.com",
    "connect-src 'self' https://*.supabase.co https://*.vercel.app https://vercel.live wss://ws-us3.pusher.com",
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
