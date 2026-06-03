import { NextResponse } from "next/server";
import { requireEnv } from "@/lib/runtime-env";

export function requireInternalAdminToken(request: Request) {
  const configuredToken = requireEnv("INTERNAL_ADMIN_TOKEN");
  const providedToken = request.headers.get("x-internal-admin-token");

  if (!configuredToken || providedToken !== configuredToken) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}
