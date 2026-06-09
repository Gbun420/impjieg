import crypto, { createHmac, timingSafeEqual } from "node:crypto";
import type { CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireEnv } from "@/lib/runtime-env";
import { createClient } from "@/lib/supabase/server";

export const ADMIN_SESSION_COOKIE = "impjieg_admin_session";
const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;
const ADMIN_SESSION_MAX_AGE_MS = ADMIN_SESSION_MAX_AGE * 1000;
type CookieStore = Awaited<ReturnType<typeof cookies>>;

export type AdminSessionPayload = {
  userId: string;
  email: string;
  issuedAt: number;
  expiresAt: number;
  nonce: string;
};

function toBase64Url(value: Buffer | string) {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url");
}

export function getAdminToken(value = process.env.INTERNAL_ADMIN_TOKEN) {
  return requireEnv("INTERNAL_ADMIN_TOKEN", value);
}

function createSessionSignature(payload: string, secret = getAdminToken()) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function timingSafeEquals(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(left), Buffer.from(right));
}

export function serializeAdminSession(payload: AdminSessionPayload) {
  const encoded = toBase64Url(JSON.stringify(payload));
  const signature = createSessionSignature(encoded);
  return `${encoded}.${signature}`;
}

export function parseAdminSession(value: string | null | undefined): AdminSessionPayload | null {
  if (!value) {
    return null;
  }

  const parts = value.split(".");
  if (parts.length !== 2) {
    return null;
  }

  const [encoded, signature] = parts;
  if (!encoded || !signature) {
    return null;
  }

  if (!timingSafeEquals(createSessionSignature(encoded), signature)) {
    return null;
  }

  try {
    const parsed = JSON.parse(fromBase64Url(encoded).toString("utf8")) as AdminSessionPayload;
    if (
      !parsed ||
      typeof parsed.userId !== "string" ||
      typeof parsed.email !== "string" ||
      typeof parsed.issuedAt !== "number" ||
      typeof parsed.expiresAt !== "number" ||
      typeof parsed.nonce !== "string"
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function hasValidAdminSession(cookieStore?: CookieStore) {
  const store = cookieStore ?? (await cookies());
  const session = store.get(ADMIN_SESSION_COOKIE)?.value;

  if (!session) {
    return false;
  }

  const payload = parseAdminSession(session);
  if (!payload) {
    return false;
  }

  // Check expiry
  if (payload.expiresAt < Date.now()) {
    return false;
  }

  if (process.env.PLAYWRIGHT_E2E === "1") {
    return true;
  }

  // Double check that we have a valid Supabase session matching the userId
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== payload.userId) {
      return false;
    }
    return true;
  } catch (error) {
    console.error("Failed to verify Supabase session in admin check:", error);
    return false;
  }
}

export async function setAdminSession(
  userId: string,
  email: string,
  cookieStore?: CookieStore
) {
  const store = cookieStore ?? (await cookies());
  const now = Date.now();
  const payload: AdminSessionPayload = {
    userId,
    email,
    issuedAt: now,
    expiresAt: now + ADMIN_SESSION_MAX_AGE_MS,
    nonce: toBase64Url(crypto.randomBytes(16)),
  };

  store.set(ADMIN_SESSION_COOKIE, serializeAdminSession(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  } satisfies CookieOptions);
}

export async function clearAdminSession(cookieStore?: CookieStore) {
  const store = cookieStore ?? (await cookies());
  store.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  } satisfies CookieOptions);
}
