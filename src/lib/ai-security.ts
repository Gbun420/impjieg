type RateLimitBucket = {
  timestamps: number[];
};

export class AiSecurityError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AiSecurityError";
    this.status = status;
  }
}

export type AiAuthenticatedUser = {
  id: string;
  email?: string | null;
};

type RateLimitStore = Map<string, RateLimitBucket>;

const globalForAiRateLimit = globalThis as typeof globalThis & {
  __impjiegAiRateLimitStore?: RateLimitStore;
};

function getRateLimitStore() {
  if (!globalForAiRateLimit.__impjiegAiRateLimitStore) {
    globalForAiRateLimit.__impjiegAiRateLimitStore = new Map();
  }

  return globalForAiRateLimit.__impjiegAiRateLimitStore;
}

export function resetAiRateLimitState() {
  getRateLimitStore().clear();
}

export function getRequestIp(request: Request) {
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

export function buildAiRateLimitKey(scope: string, user: AiAuthenticatedUser, request: Request) {
  return `${scope}:${user.id}:${getRequestIp(request)}`;
}

export function enforceAiRateLimit({
  key,
  limit,
  windowMs,
  now = Date.now(),
}: {
  key: string;
  limit: number;
  windowMs: number;
  now?: number;
}) {
  const store = getRateLimitStore();
  const bucket = store.get(key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((timestamp) => now - timestamp < windowMs);

  if (bucket.timestamps.length >= limit) {
    throw new AiSecurityError("Too many requests. Please try again later.", 429);
  }

  bucket.timestamps.push(now);
  store.set(key, bucket);

  return {
    remaining: Math.max(0, limit - bucket.timestamps.length),
    resetAt: bucket.timestamps[0] ? bucket.timestamps[0] + windowMs : now + windowMs,
  };
}

export async function readJsonBodyWithLimit<T>({
  request,
  maxBytes,
}: {
  request: Request;
  maxBytes: number;
}): Promise<T> {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number.isFinite(Number(contentLength)) && Number(contentLength) > maxBytes) {
    throw new AiSecurityError("Request body too large.", 413);
  }

  const text = await request.text();
  const bytes = new TextEncoder().encode(text).length;
  if (bytes > maxBytes) {
    throw new AiSecurityError("Request body too large.", 413);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new AiSecurityError("Invalid JSON body.", 400);
  }
}

export function normalizePromptText(value: string) {
  return value.replace(/\u0000/g, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
}

export function ensureLengthWithinLimit(
  value: string,
  maxChars: number,
  message: string
) {
  if (value.length > maxChars) {
    throw new AiSecurityError(message, 413);
  }
}
