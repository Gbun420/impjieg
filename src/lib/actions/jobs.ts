"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

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

  if (!employer) {
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

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const jobSlug = `${slugify(title)}-${Math.random().toString(36).substring(2, 6)}`;

  const { data: job, error } = await supabase
    .from("jobs")
    .insert({
      employer_id: employer.id,
      title,
      slug: jobSlug,
      description,
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
      status: listingType === "standard" ? "active" : "pending",
      expires_at: expiresAt.toISOString(),
      application_email: applicationEmail || null,
      application_url: applicationUrl || null,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/employer/jobs");
  revalidatePath("/jobs");

  if (listingType === "featured") {
    redirect(
      `/employer/checkout?jobId=${job.id}&listingType=featured`
    );
  } else {
    redirect("/employer/jobs?message=job-created");
  }
}
