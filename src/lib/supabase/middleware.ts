import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

function getAccountType(user: { user_metadata?: Record<string, unknown> } | null): string | null {
  if (!user) return null;
  const t = user.user_metadata?.accountType;
  return typeof t === "string" ? t : null;
}

export async function updateSession(request: NextRequest, requestHeaders?: Headers) {
  const supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders ?? request.headers,
    },
  });

  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // Protect employer routes — require employer account type
  if (pathname.startsWith("/employer")) {
    if (!user) {
      url.pathname = "/auth/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    const accountType = getAccountType(user);
    if (accountType !== "employer") {
      url.pathname = accountType === "candidate" ? "/candidate/dashboard" : "/auth/login";
      return NextResponse.redirect(url);
    }
  }

  // Protect candidate routes — require candidate account type (or admin bypass)
  if (pathname.startsWith("/candidate")) {
    if (!user) {
      url.pathname = "/auth/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    const accountType = getAccountType(user);
    const isAdmin = user.app_metadata?.role === "admin";
    if (accountType !== "candidate" && !isAdmin) {
      url.pathname = accountType === "employer" ? "/employer/dashboard" : "/auth/login";
      return NextResponse.redirect(url);
    }
  }

  // Protect saved-jobs route
  if (pathname === "/saved-jobs" && !user) {
    url.pathname = "/auth/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
