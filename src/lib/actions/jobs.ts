"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import type { Database, Employer, Job } from "@/lib/supabase/types";
import { sanitizeJobDescription } from "@/lib/job-description";
import { resolveEmployerCommercialEntitlements } from "@/lib/monetization/admin-grants/actions";
import { consumeGrantCredit } from "@/lib/monetization/admin-grants/actions";
import { validateSalaryRange } from "@/lib/compliance";

type EmployerRef = Pick<Employer, "id">;
type JobInsert = Database["public"]["Tables"]["jobs"]["Insert"];
type JobsMutationTable = {
  insert(values: JobInsert[]): {
    select(): {
      single(): Promise<{
        data: Job | null;
        error: { message: string } | null;
      }>;
    };
  };
};

export async function createJob(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: employer } = await supabase
    .from("employers")
    .select("id")
    .eq("user_id", user.id)
    .single();
  const typedEmployer = employer as EmployerRef | null;

  if (!typedEmployer) {
    return { error: "Employer profile not found" };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const location = formData.get("location") as string;
  const sector = formData.get("sector") as string;
  const jobType = formData.get("jobType") as string;
  const seniority = formData.get("seniority") as string;
  const remoteType = formData.get("remoteType") as string;
  const salaryMin = formData.get("salaryMin")
    ? parseInt(formData.get("salaryMin") as string)
    : null;
  const salaryMax = formData.get("salaryMax")
    ? parseInt(formData.get("salaryMax") as string)
    : null;
  const skills = (formData.get("skills") as string)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const benefits = (formData.get("benefits") as string)
    .split(",")
    .map((b) => b.trim())
    .filter(Boolean);
  const visaFriendly = formData.get("visaFriendly") === "on";
  const applicationEmail = formData.get("applicationEmail") as string;
  const applicationUrl = formData.get("applicationUrl") as string;
  const listingType = formData.get("listingType") as string;
  const sanitizedDescription = sanitizeJobDescription(description);
  const salaryValidationError = validateSalaryRange(salaryMin, salaryMax);

  if (salaryValidationError) {
    return { error: salaryValidationError };
  }

  // Check for available commercial grants/credits
  const entitlements = await resolveEmployerCommercialEntitlements(typedEmployer.id).catch(() => null);
  const hasJobCredit = (entitlements?.credits.job.remaining ?? 0) > 0;
  const hasFeaturedCredit = (entitlements?.credits.featured.remaining ?? 0) > 0;

  const useCredit = (listingType === "standard" && hasJobCredit) || (listingType === "featured" && hasFeaturedCredit);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const jobSlug = `${slugify(title)}-${Math.random().toString(36).substring(2, 6)}`;

  const jobsTable = supabase.from("jobs") as unknown as JobsMutationTable;

  const { data: job, error } = await jobsTable
    .insert([
      {
        employer_id: typedEmployer.id,
        title,
        slug: jobSlug,
        description: sanitizedDescription,
        location,
        sector,
        job_type: jobType,
        seniority: seniority || null,
        remote_type: remoteType || null,
        salary_min: salaryMin,
        salary_max: salaryMax,
        skills,
        benefits,
        visa_friendly: visaFriendly,
        is_featured: listingType === "featured",
        status: useCredit || listingType === "standard" ? "active" : "pending",
        expires_at: expiresAt.toISOString(),
        application_email: applicationEmail || null,
        application_url: applicationUrl || null,
      },
    ])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  if (!job) {
    return { error: "Failed to create job" };
  }

  // Consume the credit if used
  if (useCredit) {
    const grantId = listingType === "featured" 
      ? entitlements?.credits.featured.sourceGrantIds[0] 
      : entitlements?.credits.job.sourceGrantIds[0];
      
    if (grantId) {
      await consumeGrantCredit({ 
        grantId, 
        context: { jobId: job.id, action: "job_post_autoconsume" } 
      }).catch(err => console.error("Failed to auto-consume grant:", err));
    }
  }

  revalidatePath("/employer/jobs");
  revalidatePath("/jobs");

  if (!useCredit && listingType === "featured") {
    redirect(
      `/employer/checkout?jobId=${job.id}&listingType=featured`
    );
  } else {
    redirect("/employer/jobs?message=job-created");
  }
}
