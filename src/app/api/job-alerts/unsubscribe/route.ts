import { createClient as createServiceClient } from "@supabase/supabase-js";
import {
  verifySignedToken,
  type VerifiedSignedToken,
} from "@/lib/email-security";
import { getSupabaseServiceKey, getSupabaseUrl } from "@/lib/supabase/env";
import { enforceRateLimit, getClientIp, hashIdentifier, buildRateLimitKey, RATE_LIMITS } from "@/lib/rate-limit";
import type { Database } from "@/lib/supabase/types";

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

type JobAlertUnsubscribeDeps = {
  verifyToken?: (token: string | null, now?: number) => VerifiedSignedToken;
  updateAlertById: (alertId: string) => Promise<{
    error: { message: string } | null;
  }>;
  now?: () => number;
};

function buildHtmlResponse(status: number, title: string, bodyText: string) {
  return new Response(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; max-width: 40rem; margin: 2rem auto; padding: 0 1rem;"><h1>${title}</h1><p>${bodyText}</p></body></html>`, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

async function unsubscribeJobAlertWithDeps(
  request: Request,
  deps: JobAlertUnsubscribeDeps
) {
  let token: string | null = null;
  try {
    const { searchParams } = new URL(request.url);
    token = searchParams.get("token");
  } catch {
    return buildHtmlResponse(
      400,
      "Invalid request",
      "This unsubscribe link is invalid or malformed."
    );
  }

  const verification = deps.verifyToken
    ? deps.verifyToken(token, deps.now?.() ?? Date.now())
    : verifySignedToken(token, deps.now?.() ?? Date.now());

  if (!verification.valid || typeof verification.payload.alertId !== "string") {
    console.warn("job-alert unsubscribe rejected", {
      reason: verification.valid ? "malformed" : verification.reason,
    });
    return buildHtmlResponse(
      400,
      "Invalid unsubscribe link",
      "This unsubscribe link is invalid or expired."
    );
  }

  try {
    const { error } = await deps.updateAlertById(verification.payload.alertId);

    if (error) {
      console.warn("job-alert unsubscribe update failed", {
        category: "update_failed",
      });
      return buildHtmlResponse(
        500,
        "Unable to unsubscribe alert",
        "Please try again later."
      );
    }
  } catch {
    console.warn("job-alert unsubscribe update threw", {
      category: "unexpected_error",
    });
    return buildHtmlResponse(
      500,
      "Unable to unsubscribe alert",
      "Please try again later."
    );
  }

  return buildHtmlResponse(
    200,
    "Job alert unsubscribed",
    "You will no longer receive emails for this alert."
  );
}

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
