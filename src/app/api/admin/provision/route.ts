import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { requireInternalAdminToken } from "../../_lib/internal-route-guard";
import { logAdminAction } from "@/lib/admin-audit";
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
    const primaryAdminEmail = requireEnv(
      "ADMIN_BOOTSTRAP_PRIMARY_EMAIL",
      process.env.ADMIN_BOOTSTRAP_PRIMARY_EMAIL || ""
    );
    const primaryAdminPassword = requireEnv(
      "ADMIN_BOOTSTRAP_PRIMARY_PASSWORD",
      process.env.ADMIN_BOOTSTRAP_PRIMARY_PASSWORD || ""
    );
    const partnerAdminEmail = requireEnv(
      "ADMIN_BOOTSTRAP_PARTNER_EMAIL",
      process.env.ADMIN_BOOTSTRAP_PARTNER_EMAIL || ""
    );

    // Any password previously exposed in source control must be rotated immediately.
    const bundy = await upsertAdminPasswordAccount({
      client: supabase,
      email: primaryAdminEmail,
      password: primaryAdminPassword,
    });

    const anthony = await upsertAdminResettableAccount({
      client: supabase,
      email: partnerAdminEmail,
      baseUrl,
    });

    const auditClient = supabase as unknown as {
      from(table: "admin_audit_logs"): {
        insert(values: Array<Record<string, unknown>>): Promise<{ error: { message: string } | null }>;
      };
    };

    await logAdminAction(
      auditClient,
      {
        adminEmail: primaryAdminEmail,
        action: "admin_provision",
        entityType: "admin_accounts",
        entityId: `${primaryAdminEmail},${partnerAdminEmail}`,
        afterValue: { bundy: bundy.status, anthony: anthony.status },
      }
    );

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
