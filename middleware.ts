import { updateSession } from "@/lib/supabase/middleware";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { buildSecurityHeaders } from "@/lib/security-headers";

export async function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set(
    "Content-Security-Policy",
    buildSecurityHeaders({ nonce, isDev })["Content-Security-Policy"]
  );

  const response = hasSupabasePublicEnv()
    ? await updateSession(request, requestHeaders).catch((error) => {
        console.error(
          "Middleware session update failed:",
          error instanceof Error ? error.message : String(error)
        );
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      })
    : NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

  const hardeningHeaders = buildSecurityHeaders({ nonce, isDev });

  Object.entries(hardeningHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
