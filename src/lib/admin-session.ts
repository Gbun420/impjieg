import { createHmac, timingSafeEqual } from "crypto";
import type { CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireEnv } from "@/lib/runtime-env";
import { createClient } from "@/lib/supabase/server";

export const ADMIN_SESSION_COOKIE = "impjieg_admin_session";
const ADMIN_SESSION_MESSAGE = "impjieg-admin-session";
const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;
type CookieStore = Awaited<ReturnType<typeof cookies>>;

export function getAdminToken(value = process.env.INTERNAL_ADMIN_TOKEN) {
  return requireEnv("INTERNAL_ADMIN_TOKEN", value);
}

export function getAdminSessionValue(secret = getAdminToken()) {
  return createHmac("sha256", secret).update(ADMIN_SESSION_MESSAGE).digest("hex");
}

function timingSafeEquals(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(left), Buffer.from(right));
}

export async function hasValidAdminSession(cookieStore?: CookieStore) {
  const store = cookieStore ?? (await cookies());
  const session = store.get(ADMIN_SESSION_COOKIE)?.value;

  if (!session) {
    return false;
  }

  if (!timingSafeEquals(session, getAdminSessionValue())) {
    return false;
  }

  if (process.env.PLAYWRIGHT_E2E === "1") {
    return true;
  }

  // Double check that we have a valid Supabase session
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  } catch (error) {
    console.error("Failed to verify Supabase session in admin check:", error);
    return false;
  }
}

export async function setAdminSession(cookieStore?: CookieStore) {
  const store = cookieStore ?? (await cookies());
  store.set(ADMIN_SESSION_COOKIE, getAdminSessionValue(), {
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
