import { NextResponse } from "next/server";

export function requireInternalAdminToken(request: Request) {
  const configuredToken =
    process.env.INTERNAL_ADMIN_TOKEN || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const providedToken = request.headers.get("x-internal-admin-token");

  if (!configuredToken || providedToken !== configuredToken) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}
