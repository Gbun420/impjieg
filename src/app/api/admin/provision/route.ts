import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { requireInternalAdminToken } from "../../_lib/internal-route-guard";
import { logAdminAction } from "@/lib/admin-audit";
import { getSupabaseServiceKey, getSupabaseUrl } from "@/lib/supabase/env";
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
    const primaryAdminEmail = process.env.ADMIN_BOOTSTRAP_PRIMARY_EMAIL?.trim();
    const primaryAdminPassword = process.env.ADMIN_BOOTSTRAP_PRIMARY_PASSWORD;
    const partnerAdminEmail = process.env.ADMIN_BOOTSTRAP_PARTNER_EMAIL?.trim();
    const baseUrl = process.env.NEXT_PUBLIC_URL || new URL(request.url).origin;

    if (!primaryAdminEmail || !primaryAdminPassword) {
      return NextResponse.json(
        {
          status: "error",
          message:
            "ADMIN_BOOTSTRAP_PRIMARY_EMAIL and ADMIN_BOOTSTRAP_PRIMARY_PASSWORD must be configured.",
        },
        { status: 500 }
      );
    }

    const primaryAdmin = await upsertAdminPasswordAccount({
      client: supabase,
      email: primaryAdminEmail,
      password: primaryAdminPassword,
    });

    const accounts: Array<{ email: string; status: string }> = [primaryAdmin];

    if (partnerAdminEmail) {
      const partnerAdmin = await upsertAdminResettableAccount({
        client: supabase,
        email: partnerAdminEmail,
        baseUrl,
      });
      accounts.push(partnerAdmin);
    }

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
        afterValue: { accounts },
      }
    );

    return NextResponse.json({
      status: "success",
      message: partnerAdminEmail
        ? "Admin accounts provisioned for the approved super admin and partner admin."
        : "Admin account provisioned for the approved super admin only.",
      accounts,
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
