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

import { enforceRateLimitRedis } from "@/lib/redis-rate-limit";

export function resetAiRateLimitState() {
  // No-op for Redis-backed rate limiter
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

export async function enforceAiRateLimit({
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
  const result = await enforceRateLimitRedis({ key, limit, windowMs, now });

  if (!result.success) {
    throw new AiSecurityError("Too many requests. Please try again later.", 429);
  }

  return {
    remaining: result.remaining,
    resetAt: result.resetAt,
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

const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+previous\s+instructions/i,
  /disregard\s+previous\s+instructions/i,
  /forget\s+previous\s+instructions/i,
  /system\s+prompt/i,
  /you\s+are\s+an?\s+ai/i,
  /as\s+an\s+ai/i,
  /<\/prompt>/i,
  /<prompt>/i,
  /\[INST\]/i,
  /\[\/INST\]/i,
  /###\s*instruction/i,
  /###\s*system/i,
];

export function sanitizePromptInput(value: string, maxLength: number): string {
  let sanitized = value
    .replace(/\u0000/g, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();

  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, "[filtered]");
  }

  return sanitized;
}
