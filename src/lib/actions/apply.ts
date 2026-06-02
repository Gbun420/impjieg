"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { buildEmployerNotificationEmail } from "./apply-helpers";
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
type JobsMutationTable = {
  update(values: Database["public"]["Tables"]["jobs"]["Update"]): {
    eq(column: "id", value: string): Promise<unknown>;
  };
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

  // Increment job applications count
  const { data: currentJob } = await supabase
    .from("jobs")
    .select("applications_count")
    .eq("id", jobId)
    .single();

  const jobsTable = supabase.from("jobs") as unknown as JobsMutationTable;

  await jobsTable
    .update({
      applications_count:
        ((currentJob as { applications_count?: number } | null)
          ?.applications_count ?? 0) + 1,
    })
    .eq("id", jobId);

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
    .select("title")
    .eq("id", jobId)
    .single();
  const job = jobData as Pick<Job, "title"> | null;

  const jobTitleStr = job?.title || "a position";

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
    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      if (resendApiKey) {
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

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Impjieg <notifications@impjieg.com>",
            ...emailPayload,
          }),
        });
      }
    } catch {
      // Silently fail email notification
    }
  }

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
