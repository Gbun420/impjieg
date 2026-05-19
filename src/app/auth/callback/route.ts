import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/employer/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      const baseUrl = isLocalEnv
        ? origin
        : `https://${forwardedHost || process.env.NEXT_PUBLIC_URL || "impjieg.vercel.app"}`;
      return NextResponse.redirect(`${baseUrl}${next}`);
    }
  }

  // Return to login with error
  const redirectUrl = new URL("/auth/login", origin);
  redirectUrl.searchParams.set("error", "auth-code-error");
  return NextResponse.redirect(redirectUrl);
}
