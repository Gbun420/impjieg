import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { buildJobAlertDigestEmail, jobMatchesAlert } from "@/lib/job-alerts";
import type { Database } from "@/lib/supabase/types";

type JobAlert = Database["public"]["Tables"]["job_alerts"]["Row"];
type JobRow = Database["public"]["Tables"]["jobs"]["Row"];
type EmployerRow = Pick<
  Database["public"]["Tables"]["employers"]["Row"],
  "id" | "name" | "slug"
>;

function isAuthorized(request: Request) {
  const authHeader = request.headers.get("authorization");
  const adminHeader = request.headers.get("x-internal-admin-token");
  const cronSecret = process.env.CRON_SECRET;
  const adminSecret = process.env.INTERNAL_ADMIN_TOKEN;

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  if (adminSecret && adminHeader === adminSecret) {
    return true;
  }

  return false;
}

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return { success: false, reason: "missing_resend_key" } as const;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Impjieg <notifications@impjieg.com>",
      to: [to],
      subject,
      html,
    }),
  });

  return { success: response.ok } as const;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createServiceClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [{ data: alerts, error: alertsError }, { data: jobs, error: jobsError }] =
    await Promise.all([
      supabase.from("job_alerts").select("*").eq("is_active", true),
      supabase
        .from("jobs")
        .select("*, employers!inner(id, name, slug)")
        .eq("status", "active")
        .gte("created_at", since),
    ]);

  if (alertsError || jobsError) {
    return NextResponse.json(
      { error: alertsError?.message || jobsError?.message || "Failed to load alert data" },
      { status: 500 }
    );
  }

  let sent = 0;
  let skipped = 0;

  for (const alert of (alerts || []) as JobAlert[]) {
    const matches = ((jobs || []) as Array<JobRow & { employers: EmployerRow }>)
      .filter((job) => jobMatchesAlert(alert, job))
      .map((job) => ({
        title: job.title,
        employerName: job.employers.name,
        location: job.location,
        jobType: job.job_type,
        remoteType: job.remote_type,
        salaryMin: job.salary_min,
        salaryMax: job.salary_max,
        url: `${process.env.NEXT_PUBLIC_URL || "https://impjieg.vercel.app"}/jobs/${job.employers.slug}/${job.slug}`,
      }));

    if (matches.length === 0) {
      skipped += 1;
      continue;
    }

    const email = buildJobAlertDigestEmail({
      email: alert.email,
      alertId: alert.id,
      jobs: matches,
      baseUrl: process.env.NEXT_PUBLIC_URL || "https://impjieg.vercel.app",
    });

    const result = await sendEmail({
      to: alert.email,
      subject: email.subject,
      html: email.html,
    });

    if (result.success) {
      sent += 1;
    }
  }

  return NextResponse.json({
    success: true,
    alertsProcessed: (alerts || []).length,
    sent,
    skipped,
    since,
  });
}
