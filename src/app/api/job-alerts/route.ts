import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { z } from "zod";
import { buildJobAlertConfirmationEmail } from "@/lib/job-alerts";
import { sendEmail } from "@/lib/email-sender";
import { getSupabaseServiceKey, getSupabaseUrl } from "@/lib/supabase/env";
import { SITE } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";

type JobAlertInsert = Database["public"]["Tables"]["job_alerts"]["Insert"];

const createJobAlertSchema = z.object({
  email: z.email(),
  sector: z.string().trim().optional().or(z.literal("")),
  jobType: z.string().trim().optional().or(z.literal("")),
  remote: z.string().trim().optional().or(z.literal("")),
  salaryMin: z.coerce.number().int().min(0).optional(),
});

type JobAlertsTable = {
  insert(values: JobAlertInsert[]): Promise<{
    data: { id: string }[] | null;
    error: { message: string } | null;
  }>;
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = createJobAlertSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid job alert request" }, { status: 400 });
  }

  const supabase = createServiceClient<Database>(
    getSupabaseUrl(),
    getSupabaseServiceKey()
  );
  const jobAlertsTable = supabase.from("job_alerts") as unknown as JobAlertsTable;

  const payload = parsed.data;
  const sectors = payload.sector ? [payload.sector] : [];

  const { data, error } = await jobAlertsTable.insert([
    {
      email: payload.email,
      sectors,
      job_type: payload.jobType || null,
      remote_type: payload.remote || null,
      salary_min: payload.salaryMin ?? null,
      notification_method: "email",
      is_active: true,
    } satisfies JobAlertInsert,
  ]);

  if (error) {
    const errorCode = "code" in error ? (error as { code: string }).code : null;
    if (errorCode === "23505" || error.message.includes("duplicate key value")) {
      return NextResponse.json(
        { error: "You are already subscribed with this email" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const alertId = data?.[0]?.id ?? null;

  if (alertId) {
    const emailPayload = buildJobAlertConfirmationEmail({
      alertId,
      baseUrl: SITE.url,
    });

    await sendEmail({
      to: payload.email,
      subject: emailPayload.subject,
      html: emailPayload.html,
    });
  }

  return NextResponse.json({ success: true, alertId });
}
