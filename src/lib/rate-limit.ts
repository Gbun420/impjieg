import { createHmac } from "crypto";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const globalForRateLimit = globalThis as typeof globalThis & {
  __impjiegRateLimitStore?: Map<string, RateLimitBucket>;
};

function getRateLimitStore() {
  if (!globalForRateLimit.__impjiegRateLimitStore) {
    globalForRateLimit.__impjiegRateLimitStore = new Map();
  }
  return globalForRateLimit.__impjiegRateLimitStore;
}

export function resetRateLimitState() {
  getRateLimitStore().clear();
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown-ip";
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "unknown-ip";
}

export function buildRateLimitKey(scope: string, identifier: string): string {
  return `${scope}:${identifier}`;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
}

export function enforceRateLimit({
  key,
  limit,
  windowMs,
  now = Date.now(),
}: {
  key: string;
  limit: number;
  windowMs: number;
  now?: number;
}): RateLimitResult {
  const store = getRateLimitStore();
  const bucket = store.get(key);

  if (!bucket || now >= bucket.resetAt) {
    const newBucket = { count: 1, resetAt: now + windowMs };
    store.set(key, newBucket);
    return { success: true, remaining: limit - 1, resetAt: newBucket.resetAt, limit };
  }

  if (bucket.count >= limit) {
    return { success: false, remaining: 0, resetAt: bucket.resetAt, limit };
  }

  bucket.count += 1;
  store.set(key, bucket);
  return { success: true, remaining: limit - bucket.count, resetAt: bucket.resetAt, limit };
}

export function hashIdentifier(identifier: string): string {
  return createHmac("sha256", process.env.INTERNAL_ADMIN_TOKEN || "rate-limit-secret")
    .update(identifier)
    .digest("hex")
    .slice(0, 32);
}

export const RATE_LIMITS = {
  auth: { limit: 5, windowMs: 60_000 },
  authSignup: { limit: 3, windowMs: 60_000 },
  authResetPassword: { limit: 2, windowMs: 300_000 },
  jobAlertsCreate: { limit: 3, windowMs: 300_000 },
  jobAlertsUnsubscribe: { limit: 10, windowMs: 60_000 },
} as const;