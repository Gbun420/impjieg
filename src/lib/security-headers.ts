type SecurityHeadersOptions = {
  nonce: string;
  isDev?: boolean;
};

export function buildContentSecurityPolicy({ nonce, isDev = false }: SecurityHeadersOptions) {
  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    ...(isDev ? ["'unsafe-eval'", "https://vercel.live"] : []),
  ].join(" ");

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    `style-src 'self' 'nonce-${nonce}'`,
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://frontend-cdn.perplexity.ai",
    "connect-src 'self' https://*.supabase.co https://*.vercel.app wss://ws-us3.pusher.com",
    "media-src 'self'",
    "object-src 'none'",
    "frame-src 'self'",
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
