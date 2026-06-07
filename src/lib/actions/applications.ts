"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email-sender";
import type { Application, Database, Employer, Job } from "@/lib/supabase/types";

type EmployerRef = Pick<Employer, "id">;
type ApplicationUpdate = Database["public"]["Tables"]["applications"]["Update"];
type JobInsert = Database["public"]["Tables"]["jobs"]["Insert"];
type JobUpdate = Database["public"]["Tables"]["jobs"]["Update"];
type ApplicationsMutationTable = {
  update(values: ApplicationUpdate): {
    eq(column: "id", value: string): {
      eq(column: "employer_id", value: string): Promise<{
        error: { message: string } | null;
      }>;
    };
  };
};
type JobsMutationTable = {
  insert(values: JobInsert[]): {
    select(): {
      single(): Promise<{
        data: Job | null;
        error: { message: string } | null;
      }>;
    };
  };
  update(values: JobUpdate): {
    eq(column: "id", value: string): {
      eq(column: "employer_id", value: string): Promise<{
        error: { message: string } | null;
      }>;
    };
  };
};

export async function updateApplicationStatus(applicationId: string, status: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: employerData } = await supabase
    .from("employers")
    .select("id")
    .eq("user_id", user.id)
    .single();
  const employer = employerData as EmployerRef | null;

  if (!employer) {
    return { error: "Employer profile not found" };
  }

  const applicationsTable = supabase.from(
    "applications"
  ) as unknown as ApplicationsMutationTable;

  const { error } = await applicationsTable
    .update({ status })
    .eq("id", applicationId)
    .eq("employer_id", employer.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/employer/applications");
  revalidatePath("/employer/dashboard");
  return { success: true };
}

export async function sendCandidateEmail(applicationId: string, subject: string, message: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: applicationData } = await supabase
    .from("applications")
    .select("candidate_email, candidate_name, jobs(title)")
    .eq("id", applicationId)
    .single();
  const application = applicationData as Pick<
    Application,
    "candidate_email" | "candidate_name"
  > & { jobs: { title: string } | null } | null;

  if (!application) {
    return { error: "Application not found" };
  }

  const html = message.replace(/\n/g, "<br>");
  const text = message;

  const result = await sendEmail({
    to: { email: application.candidate_email, name: application.candidate_name },
    subject,
    html,
    text,
    replyTo: "hello@impjieg.com",
  });

  if (!result.success) {
    return { error: result.error, category: result.category };
  }

  return { success: true, email: application.candidate_email, messageId: result.messageId };
}

export async function duplicateJob(jobId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: employerData } = await supabase
    .from("employers")
    .select("id")
    .eq("user_id", user.id)
    .single();
  const employer = employerData as EmployerRef | null;

  if (!employer) {
    return { error: "Employer profile not found" };
  }

  const { data: jobData } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .eq("employer_id", employer.id)
    .single();
  const job = jobData as Job | null;

  if (!job) {
    return { error: "Job not found" };
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const newSlug = `${job.slug.split("-").slice(0, -1).join("-")}-${Math.random().toString(36).substring(2, 6)}`;

  const jobsTable = supabase.from("jobs") as unknown as JobsMutationTable;

  const { data: newJob, error } = await jobsTable
    .insert([
      {
        employer_id: employer.id,
        title: job.title,
        slug: newSlug,
        description: job.description,
        location: job.location,
        sector: job.sector,
        job_type: job.job_type,
        seniority: job.seniority,
        remote_type: job.remote_type,
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        skills: job.skills,
        benefits: job.benefits,
        visa_friendly: job.visa_friendly,
        is_featured: false,
        status: "draft",
        expires_at: expiresAt.toISOString(),
        application_email: job.application_email,
        application_url: job.application_url,
      },
    ])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  if (!newJob) {
    return { error: "Failed to duplicate job" };
  }

  revalidatePath("/employer/jobs");
  revalidatePath("/employer/dashboard");
  return { success: true, jobId: newJob.id };
}

export async function boostJob(jobId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: employerData } = await supabase
    .from("employers")
    .select("id")
    .eq("user_id", user.id)
    .single();
  const employer = employerData as EmployerRef | null;

  if (!employer) {
    return { error: "Employer profile not found" };
  }

  const jobsTable = supabase.from("jobs") as unknown as JobsMutationTable;

  const { error } = await jobsTable
    .update({ is_featured: true, status: "active" })
    .eq("id", jobId)
    .eq("employer_id", employer.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/employer/jobs");
  revalidatePath("/employer/dashboard");
  return { success: true };
}

export async function deleteJob(jobId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: employerData } = await supabase
    .from("employers")
    .select("id")
    .eq("user_id", user.id)
    .single();
  const employer = employerData as EmployerRef | null;

  if (!employer) {
    return { error: "Employer profile not found" };
  }

  const jobsTable = supabase.from("jobs") as unknown as JobsMutationTable;

  const { error } = await jobsTable
    .update({ status: "closed" })
    .eq("id", jobId)
    .eq("employer_id", employer.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/employer/jobs");
  revalidatePath("/employer/dashboard");
  return { success: true };
}

export async function withdrawApplication(applicationId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const applicationsTable = supabase.from(
    "applications"
  ) as unknown as ApplicationsMutationTable;

  const { error } = await applicationsTable
    .update({ status: "withdrawn" })
    .eq("id", applicationId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/candidate/applications");
  revalidatePath("/candidate/dashboard");
  return { success: true };
}
