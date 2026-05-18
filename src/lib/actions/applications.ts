"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateApplicationStatus(applicationId: string, status: string) {
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

  const { error } = await supabase
    .from("applications")
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

  const { data: application } = await supabase
    .from("applications")
    .select("candidate_email, candidate_name")
    .eq("id", applicationId)
    .single();

  if (!application) {
    return { error: "Application not found" };
  }

  // In production, integrate with Resend/SendGrid
  // For now, log the email (or use mailto: link in UI)
  console.log(`Email to ${application.candidate_email}:`, { subject, message });

  return { success: true, email: application.candidate_email };
}

export async function duplicateJob(jobId: string) {
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

  const { data: job } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .eq("employer_id", employer.id)
    .single();

  if (!job) {
    return { error: "Job not found" };
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const newSlug = `${job.slug.split("-").slice(0, -1).join("-")}-${Math.random().toString(36).substring(2, 6)}`;

  const { data: newJob, error } = await supabase
    .from("jobs")
    .insert({
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
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
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

  const { data: employer } = await supabase
    .from("employers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!employer) {
    return { error: "Employer profile not found" };
  }

  const { error } = await supabase
    .from("jobs")
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

  const { data: employer } = await supabase
    .from("employers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!employer) {
    return { error: "Employer profile not found" };
  }

  const { error } = await supabase
    .from("jobs")
    .update({ status: "deleted" })
    .eq("id", jobId)
    .eq("employer_id", employer.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/employer/jobs");
  revalidatePath("/employer/dashboard");
  return { success: true };
}
