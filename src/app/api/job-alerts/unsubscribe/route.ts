import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getSupabaseServiceKey, getSupabaseUrl } from "@/lib/supabase/env";
import { enforceRateLimit, getClientIp, hashIdentifier, buildRateLimitKey, RATE_LIMITS } from "@/lib/rate-limit";
import type { Database } from "@/lib/supabase/types";
import { buildHtmlResponse, unsubscribeJobAlertWithDeps } from "./logic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type JobAlertUpdate = Database["public"]["Tables"]["job_alerts"]["Update"];
type JobAlertsUpdateTable = {
  update(values: JobAlertUpdate): {
    eq(column: "id", value: string): Promise<{
      error: { message: string } | null;
    }>;
  };
};

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = enforceRateLimit({
    key: buildRateLimitKey("job-alerts-unsubscribe", hashIdentifier(ip)),
    limit: RATE_LIMITS.jobAlertsUnsubscribe.limit,
    windowMs: RATE_LIMITS.jobAlertsUnsubscribe.windowMs,
  });
  if (!rateLimit.success) {
    return new Response("Too many requests. Please try again later.", { status: 429 });
  }

  try {
    const supabaseUrl = getSupabaseUrl();
    const supabaseServiceKey = getSupabaseServiceKey();

    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn("job-alert unsubscribe setup failed", {
        category: "setup_failed",
      });
      return buildHtmlResponse(
        500,
        "Unable to unsubscribe alert",
        "System configuration error. Please try again later."
      );
    }

    const supabase = createServiceClient<Database>(
      supabaseUrl,
      supabaseServiceKey
    );

    const jobAlertsTable = supabase.from("job_alerts") as unknown as JobAlertsUpdateTable;

    return await unsubscribeJobAlertWithDeps(request, {
      updateAlertById: async (alertId) =>
        jobAlertsTable
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq("id", alertId),
    });
  } catch {
    console.warn("job-alert unsubscribe unexpected error", {
      category: "unexpected_error",
    });
    return buildHtmlResponse(
      500,
      "Unable to unsubscribe alert",
      "An unexpected error occurred. Please try again later."
    );
  }
}
