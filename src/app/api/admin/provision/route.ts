import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { requireInternalAdminToken } from "../../_lib/internal-route-guard";
import { logAdminAction } from "@/lib/admin-audit";
import { getSupabaseServiceKey, getSupabaseUrl } from "@/lib/supabase/env";
import { upsertAdminPasswordAccount } from "@/lib/admin-provision";

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
    const primaryAdminEmail = "info@dopaminedigital.co";
    const primaryAdminPassword = "Thailand2026!";

    const admin = await upsertAdminPasswordAccount({
      client: supabase,
      email: primaryAdminEmail,
      password: primaryAdminPassword,
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
        entityId: primaryAdminEmail,
        afterValue: { admin: admin.status },
      }
    );

    return NextResponse.json({
      status: "success",
      message: "Admin account provisioned for the approved super admin only.",
      accounts: [admin],
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
