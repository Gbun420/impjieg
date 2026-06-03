import { createClient as createServiceClient } from "@supabase/supabase-js";
import {
  verifySignedToken,
  type VerifiedSignedToken,
} from "@/lib/email-security";
import { getSupabaseServiceKey, getSupabaseUrl } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";

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
  return new Response(`<h1>${title}</h1><p>${bodyText}</p>`, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function unsubscribeJobAlertWithDeps(
  request: Request,
  deps: JobAlertUnsubscribeDeps
) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const verification = deps.verifyToken?.(token, deps.now?.() ?? Date.now()) ?? verifySignedToken(token);

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
        message: error.message,
      });
      return buildHtmlResponse(
        500,
        "Unable to unsubscribe alert",
        "Please try again later."
      );
    }
  } catch (caughtError) {
    console.warn("job-alert unsubscribe update threw", {
      message: caughtError instanceof Error ? caughtError.message : "unknown",
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
  try {
    const supabase = createServiceClient<Database>(
      getSupabaseUrl(),
      getSupabaseServiceKey()
    );

    const jobAlertsTable = supabase.from("job_alerts") as unknown as JobAlertsUpdateTable;

    return unsubscribeJobAlertWithDeps(request, {
      updateAlertById: async (alertId) =>
        jobAlertsTable
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq("id", alertId),
    });
  } catch (caughtError) {
    console.warn("job-alert unsubscribe setup failed", {
      message: caughtError instanceof Error ? caughtError.message : "unknown",
    });
    return buildHtmlResponse(
      500,
      "Unable to unsubscribe alert",
      "Please try again later."
    );
  }
}
