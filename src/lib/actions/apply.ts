"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { buildEmployerNotificationEmail, buildCandidateConfirmationEmail } from "./apply-helpers";
import { sendEmail } from "@/lib/email-sender";
import { getSupabaseServiceKey, getSupabaseUrl } from "@/lib/supabase/env";
import type {
  Application,
  Database,
  Employer,
  Job,
} from "@/lib/supabase/types";

type ApplicationInsert = Database["public"]["Tables"]["applications"]["Insert"];
type CandidateApplicationInsert =
  Database["public"]["Tables"]["candidate_applications"]["Insert"];
type ApplicationMutationTable = {
  insert(values: ApplicationInsert[]): {
    select(): {
      single(): Promise<{
        data: Application | null;
        error: { message: string } | null;
      }>;
    };
  };
};
type CandidateApplicationTable = {
  insert(values: CandidateApplicationInsert[]): Promise<unknown>;
};
type ApplicationCountRpcClient = {
  rpc(
    fn: "increment_job_applications_count",
    args: { job_uuid: string }
  ): Promise<{ error: { message: string } | null }>;
};

export async function submitApplication(formData: FormData) {
  const supabase = await createClient();

  const jobId = formData.get("jobId") as string;
  const employerId = formData.get("employerId") as string;
  const candidateName = formData.get("candidateName") as string;
  const candidateEmail = formData.get("candidateEmail") as string;
  const candidatePhone = formData.get("candidatePhone") as string;
  const coverLetter = formData.get("coverLetter") as string;
  const cvUrl = formData.get("cvUrl") as string;

  if (!jobId || !employerId || !candidateName || !candidateEmail) {
    return { error: "Please fill in all required fields" };
  }

  const applicationsTable = supabase.from(
    "applications"
  ) as unknown as ApplicationMutationTable;

  const { data: application, error } = await applicationsTable
    .insert([
      {
        job_id: jobId,
        employer_id: employerId,
        candidate_name: candidateName,
        candidate_email: candidateEmail,
        candidate_phone: candidatePhone || null,
        candidate_cv_url: cvUrl || null,
        cover_letter: coverLetter || null,
        status: "new",
      },
    ])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  if (!application) {
    return { error: "Failed to create application" };
  }

  // Track application for logged-in candidates
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const serviceSupabase = createServiceClient(
      getSupabaseUrl(),
      getSupabaseServiceKey()
    );

    const candidateApplicationsTable = serviceSupabase.from(
      "candidate_applications"
    ) as unknown as CandidateApplicationTable;

    await candidateApplicationsTable.insert([
      {
        user_id: user.id,
        job_id: jobId,
        application_id: application.id,
        status: "applied",
      },
    ]);
  }

  const { error: applicationCountError } = await (supabase as unknown as ApplicationCountRpcClient).rpc(
    "increment_job_applications_count",
    { job_uuid: jobId }
  );

  if (applicationCountError) {
    return { error: applicationCountError.message };
  }

  // Get employer info for notification
  const { data: employerData } = await supabase
    .from("employers")
    .select("user_id, name, whatsapp_notifications, whatsapp_number, email_notifications")
    .eq("id", employerId)
    .single();
  const employer = employerData as Pick<
    Employer,
    "user_id" | "name" | "whatsapp_notifications" | "whatsapp_number" | "email_notifications"
  > | null;

  // Get job title for notification
  const { data: jobData } = await supabase
    .from("jobs")
    .select("title, employers(name)")
    .eq("id", jobId)
    .single();
  const job = jobData as (Pick<Job, "title"> & { employers: { name: string } }) | null;

  const jobTitleStr = job?.title || "a position";
  const employerName = job?.employers?.name || "the employer";

  let employerEmail: string | null = null;
  if (employer?.user_id) {
    const serviceSupabase = createServiceClient(
      getSupabaseUrl(),
      getSupabaseServiceKey()
    );
    const {
      data: { user: employerUser },
    } = await serviceSupabase.auth.admin.getUserById(employer.user_id);
    employerEmail = employerUser?.email ?? null;
  }

  // Send email notification to employer
  if (employer && employer.email_notifications !== false && employerEmail) {
    const emailPayload = buildEmployerNotificationEmail({
      employerEmail,
      candidateEmail,
      candidateName,
      candidatePhone,
      coverLetter,
      cvUrl,
      jobTitle: jobTitleStr,
      dashboardUrl: `${process.env.NEXT_PUBLIC_URL}/employer/applications`,
    });

    await sendEmail({
      to: employerEmail,
      subject: emailPayload.subject,
      html: emailPayload.html,
      replyTo: candidateEmail,
    });
  }

  // Send email confirmation to candidate
  await sendEmail({
    to: candidateEmail,
    subject: `Application Received: ${jobTitleStr} at ${employerName}`,
    html: buildCandidateConfirmationEmail({
      candidateName,
      jobTitle: jobTitleStr,
      employerName,
    }).html,
  });

  // Send WhatsApp notification if enabled
  if (employer && employer.whatsapp_notifications && employer.whatsapp_number) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_URL || "https://impjieg.vercel.app"}/api/notifications/whatsapp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-admin-token":
            process.env.INTERNAL_ADMIN_TOKEN ||
            getSupabaseServiceKey() ||
            "",
        },
        body: JSON.stringify({
          applicationId: application.id,
          candidateName,
          jobTitle: jobTitleStr,
          employerPhone: employer.whatsapp_number,
        }),
      });
    } catch {
      // Silently fail notification
    }
  }

  revalidatePath(`/jobs/[employerSlug]/[jobSlug]`);
  return { success: true };
}
