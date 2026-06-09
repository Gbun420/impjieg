"use server";

import { cookies } from "next/headers";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseUrl, getSupabaseServiceKey } from "@/lib/supabase/env";
import { getAuthContext } from "@/lib/auth/account-access";
import {
  assertTalentDirectoryEnabled,
  assertCandidateAccount,
  assertEmployerAccount,
  getEmployerTalentAccess,
  hasActiveTalentAccess,
  getCreditBalance,
  generateDirectorySlug,
} from "./access";
import {
  searchDirectory,
  getCandidateDirectoryProfile,
  getContactRequestsForCandidate,
  getContactRequestsForEmployer,
} from "./queries";
import {
  candidateDirectorySettingsSchema,
  createContactRequestSchema,
  respondToContactRequestSchema,
  type CandidateDirectorySettingsInput,
  type EmployerTalentSearchInput,
  type CreateContactRequestInput,
  type RespondToContactRequestInput,
} from "./validation";
import {
  TALENT_DIRECTORY_CONSENT_VERSION,
  type TalentDirectoryAuditAction,
} from "./constants";
import type { TalentDirectoryActionResult } from "./types";

// ============================================================================
// Helpers
// ============================================================================

function logAuditEvent(params: {
  actorUserId?: string;
  actorType: "candidate" | "employer" | "admin" | "system";
  candidateUserId?: string;
  employerId?: string;
  action: TalentDirectoryAuditAction;
  metadata?: Record<string, unknown>;
}): void {
  const serviceSupabase = createServiceClient(
    getSupabaseUrl(),
    getSupabaseServiceKey()
  );

  serviceSupabase.from("candidate_directory_audit_logs" as any).insert({
    actor_user_id: params.actorUserId ?? null,
    actor_type: params.actorType,
    candidate_user_id: params.candidateUserId ?? null,
    employer_id: params.employerId ?? null,
    action: params.action,
    metadata: params.metadata ?? {},
  });
}

// ============================================================================
// Candidate Actions
// ============================================================================

export async function optInToDirectory(
  formData: CandidateDirectorySettingsInput
): Promise<TalentDirectoryActionResult> {
  try {
    assertTalentDirectoryEnabled();

    const ctx = await getAuthContext();
    assertCandidateAccount(ctx);

    const parsed = candidateDirectorySettingsSchema.safeParse(formData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".");
        if (!fieldErrors[key]) fieldErrors[key] = [];
        fieldErrors[key].push(issue.message);
      }
      return { ok: false, error: "Validation failed", fieldErrors };
    }

    const data = parsed.data;
    const supabase = await createClient();
    const serviceSupabase = createServiceClient(
      getSupabaseUrl(),
      getSupabaseServiceKey()
    );

    // Get existing profile
    const { data: existing } = await supabase
      .from("candidate_directory_profiles" as any)
      .select("id, slug")
      .eq("candidate_user_id", ctx.user.id)
      .maybeSingle() as { data: { id: string; slug: string } | null };

    // Get candidate_profile for reference
    const { data: candidateProfile } = await supabase
      .from("candidate_profiles")
      .select("id")
      .eq("user_id", ctx.user.id)
      .maybeSingle() as { data: { id: string } | null };

    const now = new Date().toISOString();
    const slug = existing?.slug ?? generateDirectorySlug(ctx.user.email ?? "candidate");

    if (existing) {
      // Update existing profile
      const { error } = await serviceSupabase
        .from("candidate_directory_profiles" as any)
        .update({
          visibility_status: "searchable",
          display_mode: data.displayMode,
          headline: data.headline ?? null,
          summary: data.summary ?? null,
          skills: data.skills,
          sectors: data.sectors,
          job_types: data.jobTypes,
          remote_preference: data.remotePreference ?? null,
          experience_years: data.experienceYears ?? null,
          desired_salary_min: data.desiredSalaryMin ?? null,
          desired_salary_max: data.desiredSalaryMax ?? null,
          availability: data.availability ?? null,
          allow_contact_requests: data.allowContactRequests,
          allow_cv_requests: data.allowCvRequests,
          allow_direct_cv_download: data.allowDirectCvDownload,
          consent_version: TALENT_DIRECTORY_CONSENT_VERSION,
          opted_in_at: now,
          opted_out_at: null,
        })
        .eq("id", existing.id);

      if (error) {
        return { ok: false, error: "Failed to update directory profile" };
      }
    } else {
      // Create new profile
      const { error } = await serviceSupabase
        .from("candidate_directory_profiles" as any)
        .insert({
          candidate_user_id: ctx.user.id,
          candidate_profile_id: candidateProfile?.id ?? null,
          slug,
          visibility_status: "searchable",
          display_mode: data.displayMode,
          headline: data.headline ?? null,
          summary: data.summary ?? null,
          skills: data.skills,
          sectors: data.sectors,
          job_types: data.jobTypes,
          remote_preference: data.remotePreference ?? null,
          experience_years: data.experienceYears ?? null,
          desired_salary_min: data.desiredSalaryMin ?? null,
          desired_salary_max: data.desiredSalaryMax ?? null,
          availability: data.availability ?? null,
          allow_contact_requests: data.allowContactRequests,
          allow_cv_requests: data.allowCvRequests,
          allow_direct_cv_download: data.allowDirectCvDownload,
          consent_version: TALENT_DIRECTORY_CONSENT_VERSION,
          opted_in_at: now,
        });

      if (error) {
        return { ok: false, error: "Failed to create directory profile" };
      }
    }

    logAuditEvent({
      actorUserId: ctx.user.id,
      actorType: "candidate",
      candidateUserId: ctx.user.id,
      action: "candidate_opted_in",
      metadata: { slug },
    });

    return { ok: true, data: { slug }, message: "You are now visible in the Talent Directory" };
  } catch (error) {
    if (error instanceof Error && error.message === "Talent Directory is not enabled") {
      return { ok: false, error: "Talent Directory is not currently available" };
    }
    console.error("[TalentDirectory] optInToDirectory error:", error);
    return { ok: false, error: "An unexpected error occurred" };
  }
}

export async function pauseDirectory(): Promise<TalentDirectoryActionResult> {
  try {
    assertTalentDirectoryEnabled();
    const ctx = await getAuthContext();
    assertCandidateAccount(ctx);

    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("candidate_directory_profiles" as any)
      .select("id")
      .eq("candidate_user_id", ctx.user.id)
      .maybeSingle() as { data: any };

    if (!profile) {
      return { ok: false, error: "No directory profile found" };
    }

    const serviceSupabase = createServiceClient(
      getSupabaseUrl(),
      getSupabaseServiceKey()
    );

    const { error } = await serviceSupabase
      .from("candidate_directory_profiles" as any)
      .update({ visibility_status: "paused" })
      .eq("id", profile.id);

    if (error) {
      return { ok: false, error: "Failed to pause directory profile" };
    }

    logAuditEvent({
      actorUserId: ctx.user.id,
      actorType: "candidate",
      candidateUserId: ctx.user.id,
      action: "candidate_paused_visibility",
    });

    return { ok: true, message: "Your directory profile is now paused" };
  } catch (error) {
    console.error("[TalentDirectory] pauseDirectory error:", error);
    return { ok: false, error: "An unexpected error occurred" };
  }
}

export async function leaveDirectory(): Promise<TalentDirectoryActionResult> {
  try {
    assertTalentDirectoryEnabled();
    const ctx = await getAuthContext();
    assertCandidateAccount(ctx);

    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("candidate_directory_profiles" as any)
      .select("id")
      .eq("candidate_user_id", ctx.user.id)
      .maybeSingle() as { data: any };

    if (!profile) {
      return { ok: false, error: "No directory profile found" };
    }

    const serviceSupabase = createServiceClient(
      getSupabaseUrl(),
      getSupabaseServiceKey()
    );

    const { error } = await serviceSupabase
      .from("candidate_directory_profiles" as any)
      .delete()
      .eq("id", profile.id);

    if (error) {
      return { ok: false, error: "Failed to leave directory" };
    }

    logAuditEvent({
      actorUserId: ctx.user.id,
      actorType: "candidate",
      candidateUserId: ctx.user.id,
      action: "candidate_left_directory",
    });

    return { ok: true, message: "You have left the Talent Directory" };
  } catch (error) {
    console.error("[TalentDirectory] leaveDirectory error:", error);
    return { ok: false, error: "An unexpected error occurred" };
  }
}

// ============================================================================
// Employer Actions
// ============================================================================

export async function searchTalentDirectory(
  input: EmployerTalentSearchInput
): Promise<TalentDirectoryActionResult> {
  try {
    assertTalentDirectoryEnabled();

    const ctx = await getAuthContext();
    assertEmployerAccount(ctx);

    // Get employer ID
    const supabase = await createClient();
    const { data: employer } = await supabase
      .from("employers")
      .select("id")
      .eq("user_id", ctx.user.id)
      .maybeSingle() as { data: any };

    if (!employer) {
      return { ok: false, error: "Employer profile not found" };
    }

    // Check access
    const access = await getEmployerTalentAccess(employer.id);
    if (!hasActiveTalentAccess(access)) {
      return {
        ok: false,
        error: "Talent Directory access required. Please subscribe to a plan.",
      };
    }

    const result = await searchDirectory(input);
    return { ok: true, data: result };
  } catch (error) {
    if (error instanceof Error && error.message === "Talent Directory is not enabled") {
      return { ok: false, error: "Talent Directory is not currently available" };
    }
    console.error("[TalentDirectory] searchTalentDirectory error:", error);
    return { ok: false, error: "An unexpected error occurred" };
  }
}

export async function sendContactRequest(
  input: CreateContactRequestInput
): Promise<TalentDirectoryActionResult> {
  try {
    assertTalentDirectoryEnabled();

    const ctx = await getAuthContext();
    assertEmployerAccount(ctx);

    const parsed = createContactRequestSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Invalid request data" };
    }

    const data = parsed.data;

    // Verify employer owns this employer_id
    const supabase = await createClient();
    const { data: employer } = await supabase
      .from("employers")
      .select("id")
      .eq("user_id", ctx.user.id)
      .eq("id", data.employerId)
      .maybeSingle() as { data: any };

    if (!employer) {
      return { ok: false, error: "Employer profile not found" };
    }

    // Check access and credits
    const access = await getEmployerTalentAccess(employer.id);
    if (!hasActiveTalentAccess(access)) {
      return { ok: false, error: "Talent Directory access required" };
    }
    const balance = getCreditBalance(access);
    if (!balance || balance.remaining <= 0) {
      return { ok: false, error: "No contact credits remaining" };
    }

    // Check target profile exists and is searchable
    const { data: targetProfile } = await supabase
      .from("candidate_directory_profiles" as any)
      .select("id, candidate_user_id")
      .eq("id", data.candidateDirectoryProfileId)
      .eq("visibility_status", "searchable")
      .maybeSingle() as { data: any };

    if (!targetProfile) {
      return { ok: false, error: "Candidate profile not found or not searchable" };
    }

    // Check for existing pending request
    const { data: existingRequest } = await supabase
      .from("candidate_contact_requests" as any)
      .select("id")
      .eq("employer_id", employer.id)
      .eq("candidate_user_id", targetProfile.candidate_user_id)
      .eq("status", "pending")
      .maybeSingle() as { data: any };

    if (existingRequest) {
      return { ok: false, error: "You already have a pending request with this candidate" };
    }

    // Create contact request
    const serviceSupabase = createServiceClient(
      getSupabaseUrl(),
      getSupabaseServiceKey()
    );

    const { error } = await serviceSupabase
      .from("candidate_contact_requests" as any)
      .insert({
        employer_id: employer.id,
        candidate_user_id: targetProfile.candidate_user_id,
        directory_profile_id: targetProfile.id,
        message: data.message,
        status: "pending",
      });

    if (error) {
      return { ok: false, error: "Failed to send contact request" };
    }

    logAuditEvent({
      actorUserId: ctx.user.id,
      actorType: "employer",
      candidateUserId: targetProfile.candidate_user_id,
      employerId: employer.id,
      action: "contact_request_created",
      metadata: { targetProfileId: targetProfile.id },
    });

    return { ok: true, message: "Contact request sent" };
  } catch (error) {
    if (error instanceof Error && error.message === "Talent Directory is not enabled") {
      return { ok: false, error: "Talent Directory is not currently available" };
    }
    console.error("[TalentDirectory] sendContactRequest error:", error);
    return { ok: false, error: "An unexpected error occurred" };
  }
}

// ============================================================================
// Candidate Contact Request Actions
// ============================================================================

export async function respondToContactRequest(
  input: RespondToContactRequestInput
): Promise<TalentDirectoryActionResult> {
  try {
    assertTalentDirectoryEnabled();

    const ctx = await getAuthContext();
    assertCandidateAccount(ctx);

    const parsed = respondToContactRequestSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Invalid request data" };
    }

    const data = parsed.data;

    // Get the request
    const supabase = await createClient();
    const { data: request } = await supabase
      .from("candidate_contact_requests" as any)
      .select("*, employer:employers(id, name)")
      .eq("id", data.requestId)
      .eq("candidate_user_id", ctx.user.id)
      .eq("status", "pending")
      .maybeSingle() as { data: any };

    if (!request) {
      return { ok: false, error: "Request not found or already responded" };
    }

    const serviceSupabase = createServiceClient(
      getSupabaseUrl(),
      getSupabaseServiceKey()
    );

    const updateData: Record<string, unknown> = {
      status: data.status,
      candidate_response_message: data.responseMessage ?? null,
    };

    // If accepted, consume credit and reveal contact info
    if (data.status === "accepted") {
      updateData.credit_consumed_at = new Date().toISOString();

      // Consume credit from employer access
      const { data: access } = await serviceSupabase
        .from("employer_talent_access" as any)
        .select("id, contact_credits_used")
        .eq("employer_id", request.employer_id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle() as { data: any };

      if (access) {
        await serviceSupabase
          .from("employer_talent_access" as any)
          .update({
            contact_credits_used: access.contact_credits_used + 1,
          })
          .eq("id", access.id);

        logAuditEvent({
          actorUserId: ctx.user.id,
          actorType: "system",
          candidateUserId: ctx.user.id,
          employerId: request.employer_id,
          action: "credit_consumed",
          metadata: { requestId: data.requestId },
        });
      }

      // Get candidate email for employer visibility
      const { data: user } = await serviceSupabase.auth.admin.getUserById(
        ctx.user.id
      );
      if (user?.user?.email) {
        updateData.employer_visible_email = user.user.email;
      }
    }

    const { error } = await serviceSupabase
      .from("candidate_contact_requests" as any)
      .update(updateData)
      .eq("id", data.requestId);

    if (error) {
      return { ok: false, error: "Failed to respond to request" };
    }

    logAuditEvent({
      actorUserId: ctx.user.id,
      actorType: "candidate",
      candidateUserId: ctx.user.id,
      employerId: request.employer_id,
      action: data.status === "accepted" ? "contact_request_accepted" : "contact_request_rejected",
      metadata: { requestId: data.requestId },
    });

    return {
      ok: true,
      message: data.status === "accepted"
        ? "Request accepted. The employer can now see your contact details."
        : "Request rejected.",
    };
  } catch (error) {
    console.error("[TalentDirectory] respondToContactRequest error:", error);
    return { ok: false, error: "An unexpected error occurred" };
  }
}
