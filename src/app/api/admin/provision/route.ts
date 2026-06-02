import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { requireInternalAdminToken } from "../../_lib/internal-route-guard";
import { getSupabaseServiceKey, getSupabaseUrl } from "@/lib/supabase/env";
import { requireEnv } from "@/lib/runtime-env";
import {
  upsertAdminPasswordAccount,
  upsertAdminResettableAccount,
} from "@/lib/admin-provision";

export async function GET(request: Request) {
  const forbidden = requireInternalAdminToken(request);
  if (forbidden) {
    return forbidden;
  }

  return NextResponse.json({
    status: "ready",
    message: "POST to provision the admin accounts.",
  });
}

export async function POST(request: Request) {
  const forbidden = requireInternalAdminToken(request);
  if (forbidden) {
    return forbidden;
  }

  try {
    const supabase = createClient(getSupabaseUrl(), getSupabaseServiceKey());
    const baseUrl = requireEnv(
      "NEXT_PUBLIC_URL",
      process.env.NEXT_PUBLIC_URL || "https://impjieg.vercel.app"
    );

    const bundy = await upsertAdminPasswordAccount({
      client: supabase,
      email: "bundyglenn@gmail.com",
      password: "Floyd420!",
    });

    const anthony = await upsertAdminResettableAccount({
      client: supabase,
      email: "anthonymackaymt@gmail.com",
      baseUrl,
    });

    return NextResponse.json({
      status: "success",
      message:
        "Admin accounts provisioned. A secure password reset email was sent for the partner account.",
      accounts: [bundy, anthony],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        status: "error",
        message,
      },
      { status: 500 }
    );
  }
}
