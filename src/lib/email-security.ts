import { createHmac, timingSafeEqual } from "crypto";
import { requireEnv } from "@/lib/runtime-env";

const UNSUBSCRIBE_TOKEN_VERSION = 1;

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function sanitizeEmailHeader(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

export function safeUrlHref(value: string, fallback = "#") {
  try {
    const url = new URL(value);
    if (!["http:", "https:", "mailto:"].includes(url.protocol)) {
      return fallback;
    }

    return url.toString();
  } catch {
    return fallback;
  }
}

export function buildAbsoluteUrl(baseUrl: string, path: string) {
  try {
    return new URL(path, baseUrl).toString();
  } catch {
    return new URL(path, "https://impjieg.vercel.app").toString();
  }
}

function getUnsubscribeSecret() {
  return requireEnv("JOB_ALERT_UNSUBSCRIBE_SECRET");
}

function signTokenPayload(payload: string) {
  return createHmac("sha256", getUnsubscribeSecret()).update(payload).digest("base64url");
}

function timingSafeEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function createSignedToken(
  payload: Record<string, string | number>,
  expiresInMs = 1000 * 60 * 60 * 24 * 365,
  now = Date.now()
) {
  const body = {
    v: UNSUBSCRIBE_TOKEN_VERSION,
    exp: now + expiresInMs,
    ...payload,
  };
  const encodedBody = Buffer.from(JSON.stringify(body)).toString("base64url");
  const signature = signTokenPayload(encodedBody);
  return `${encodedBody}.${signature}`;
}

type VerifiedToken =
  | {
      valid: true;
      payload: {
        v: number;
        exp: number;
        [key: string]: string | number;
      };
    }
  | {
      valid: false;
      reason: "missing" | "malformed" | "invalid" | "expired";
    };

export function verifySignedToken(token: string | null, now = Date.now()): VerifiedToken {
  if (!token) {
    return { valid: false, reason: "missing" };
  }

  const [encodedBody, signature] = token.split(".");
  if (!encodedBody || !signature) {
    return { valid: false, reason: "malformed" };
  }

  const expectedSignature = signTokenPayload(encodedBody);
  if (!timingSafeEquals(signature, expectedSignature)) {
    return { valid: false, reason: "invalid" };
  }

  try {
    const parsed = JSON.parse(Buffer.from(encodedBody, "base64url").toString("utf8")) as {
      v?: unknown;
      exp?: unknown;
      [key: string]: unknown;
    };

    if (parsed.v !== UNSUBSCRIBE_TOKEN_VERSION || typeof parsed.exp !== "number") {
      return { valid: false, reason: "malformed" };
    }

    if (parsed.exp < now) {
      return { valid: false, reason: "expired" };
    }

    return {
      valid: true,
      payload: parsed as VerifiedToken extends { valid: true; payload: infer P } ? P : never,
    };
  } catch {
    return { valid: false, reason: "malformed" };
  }
}

export function buildJobAlertUnsubscribeUrl({
  baseUrl,
  alertId,
  expiresInMs,
  now,
}: {
  baseUrl: string;
  alertId: string;
  expiresInMs?: number;
  now?: number;
}) {
  const token = createSignedToken({ alertId }, expiresInMs, now);
  const url = new URL("/api/job-alerts/unsubscribe", baseUrl);
  url.searchParams.set("token", token);
  return url.toString();
}

export type VerifiedSignedToken =
  | {
      valid: true;
      payload: {
        v: number;
        exp: number;
        [key: string]: string | number;
      };
    }
  | {
      valid: false;
      reason: "missing" | "malformed" | "invalid" | "expired";
    };
