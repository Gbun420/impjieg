import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getSupabaseUrl, getSupabaseServiceKey } from "@/lib/supabase/env";
import type {
  EmployerVisibleProfile,
  DirectorySearchResult,
  DirectoryOverviewStats,
  CandidateDirectoryProfileFull,
  AuditLogWithDetails,
  TalentAccessWithEmployer,
  ContactRequestWithDetails,
} from "./types";
import type { EmployerTalentSearchInput } from "./validation";

// ============================================================================
// Candidate Queries
// ============================================================================

export async function getCandidateDirectoryProfile(
  candidateUserId: string
): Promise<CandidateDirectoryProfileFull | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("candidate_directory_profiles")
    .select("*, candidate_profile:candidate_profiles(full_name, phone, bio, website, linkedin_url)")
    .eq("candidate_user_id", candidateUserId)
    .maybeSingle();

  return data as CandidateDirectoryProfileFull | null;
}

export async function getCandidateDirectoryProfileBySlug(
  slug: string
): Promise<CandidateDirectoryProfileFull | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("candidate_directory_profiles")
    .select("*, candidate_profile:candidate_profiles(full_name, phone, bio, website, linkedin_url)")
    .eq("slug", slug)
    .maybeSingle();

  return data as CandidateDirectoryProfileFull | null;
}

// ============================================================================
// Employer Queries
// ============================================================================

export async function searchDirectory(
  input: EmployerTalentSearchInput
): Promise<DirectorySearchResult> {
  const serviceSupabase = createServiceClient(
    getSupabaseUrl(),
    getSupabaseServiceKey()
  );

  let query = serviceSupabase
    .from("candidate_directory_profiles")
    .select(
      "id, slug, display_mode, headline, summary, location, skills, sectors, job_types, remote_preference, experience_years, desired_salary_min, desired_salary_max, availability, allow_cv_requests, created_at",
      { count: "exact" }
    )
    .eq("visibility_status", "searchable");

  // Text search on headline/summary
  if (input.query) {
    query = query.or(`headline.ilike.%${input.query}%,summary.ilike.%${input.query}%`);
  }

  // Skills filter (overlap)
  if (input.skills && input.skills.length > 0) {
    query = query.overlaps("skills", input.skills);
  }

  // Sectors filter (overlap)
  if (input.sectors && input.sectors.length > 0) {
    query = query.overlaps("sectors", input.sectors);
  }

  // Location filter
  if (input.locations && input.locations.length > 0) {
    query = query.in("location", input.locations);
  }

  // Experience range
  if (input.experienceYearsMin !== undefined) {
    query = query.gte("experience_years", input.experienceYearsMin);
  }
  if (input.experienceYearsMax !== undefined) {
    query = query.lte("experience_years", input.experienceYearsMax);
  }

  // Salary range
  if (input.salaryMin !== undefined) {
    query = query.gte("desired_salary_max", input.salaryMin);
  }
  if (input.salaryMax !== undefined) {
    query = query.lte("desired_salary_min", input.salaryMax);
  }

  // Remote preference
  if (input.remotePreference) {
    query = query.eq("remote_preference", input.remotePreference);
  }

  // Availability
  if (input.availability) {
    query = query.ilike("availability", `%${input.availability}%`);
  }

  // Pagination
  const offset = (input.page - 1) * input.limit;
  query = query
    .order("created_at", { ascending: false })
    .range(offset, offset + input.limit - 1);

  const { data, count, error } = await query;

  if (error) {
    throw new Error(`Search failed: ${error.message}`);
  }

  const profiles = (data ?? []) as EmployerVisibleProfile[];
  const total = count ?? 0;

  return {
    profiles,
    total,
    page: input.page,
    limit: input.limit,
    hasMore: offset + profiles.length < total,
  };
}

export async function getDirectoryProfileForEmployer(
  slug: string
): Promise<EmployerVisibleProfile | null> {
  const serviceSupabase = createServiceClient(
    getSupabaseUrl(),
    getSupabaseServiceKey()
  );

  const { data } = await serviceSupabase
    .from("candidate_directory_profiles")
    .select(
      "id, slug, display_mode, headline, summary, location, skills, sectors, job_types, remote_preference, experience_years, desired_salary_min, desired_salary_max, availability, allow_cv_requests, created_at"
    )
    .eq("slug", slug)
    .eq("visibility_status", "searchable")
    .maybeSingle();

  return data as EmployerVisibleProfile | null;
}

// ============================================================================
// Contact Request Queries
// ============================================================================

export async function getContactRequestsForCandidate(
  candidateUserId: string
): Promise<ContactRequestWithDetails[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("candidate_contact_requests")
    .select("*, employer:employers(id, name, slug, logo_url, location), directory_profile:candidate_directory_profiles(id, slug, headline, display_mode)")
    .eq("candidate_user_id", candidateUserId)
    .order("created_at", { ascending: false });

  return (data ?? []) as ContactRequestWithDetails[];
}

export async function getContactRequestsForEmployer(
  employerId: string
): Promise<ContactRequestWithDetails[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("candidate_contact_requests")
    .select("*, directory_profile:candidate_directory_profiles(id, slug, headline, display_mode)")
    .eq("employer_id", employerId)
    .order("created_at", { ascending: false });

  return (data ?? []) as ContactRequestWithDetails[];
}

export async function getContactRequestById(
  requestId: string
): Promise<ContactRequestWithDetails | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("candidate_contact_requests")
    .select("*, employer:employers(id, name, slug, logo_url, location), directory_profile:candidate_directory_profiles(id, slug, headline, display_mode)")
    .eq("id", requestId)
    .maybeSingle();

  return data as ContactRequestWithDetails | null;
}

// ============================================================================
// Employer Access Queries
// ============================================================================

export async function getAllEmployerTalentAccess(): Promise<
  TalentAccessWithEmployer[]
> {
  const serviceSupabase = createServiceClient(
    getSupabaseUrl(),
    getSupabaseServiceKey()
  );

  const { data } = await serviceSupabase
    .from("employer_talent_access")
    .select("*, employer:employers(id, name, slug, logo_url)")
    .order("created_at", { ascending: false });

  return (data ?? []) as TalentAccessWithEmployer[];
}

// ============================================================================
// Admin Queries
// ============================================================================

export async function getDirectoryOverviewStats(): Promise<DirectoryOverviewStats> {
  const serviceSupabase = createServiceClient(
    getSupabaseUrl(),
    getSupabaseServiceKey()
  );

  const [profiles, employers, requests, credits] = await Promise.all([
    serviceSupabase
      .from("candidate_directory_profiles")
      .select("visibility_status", { count: "exact" }),
    serviceSupabase
      .from("employer_talent_access")
      .select("id", { count: "exact" })
      .eq("status", "active"),
    serviceSupabase
      .from("candidate_contact_requests")
      .select("status", { count: "exact" }),
    serviceSupabase
      .from("employer_talent_access")
      .select("contact_credits_used"),
  ]);

  const allProfiles = profiles.data ?? [];
  const totalProfiles = profiles.count ?? 0;
  const searchableProfiles = allProfiles.filter(
    (p) => p.visibility_status === "searchable"
  ).length;
  const pausedProfiles = allProfiles.filter(
    (p) => p.visibility_status === "paused"
  ).length;
  const privateProfiles = totalProfiles - searchableProfiles - pausedProfiles;

  const allRequests = requests.data ?? [];
  const totalContactRequests = requests.count ?? 0;
  const pendingRequests = allRequests.filter(
    (r) => r.status === "pending"
  ).length;

  const creditsConsumed = (credits.data ?? []).reduce(
    (sum, r) => sum + (r.contact_credits_used ?? 0),
    0
  );

  return {
    totalProfiles,
    searchableProfiles,
    pausedProfiles,
    privateProfiles,
    activeEmployers: employers.count ?? 0,
    totalContactRequests,
    pendingRequests,
    creditsConsumed,
  };
}

export async function getAllDirectoryProfiles(
  page = 1,
  limit = 20
): Promise<{ profiles: CandidateDirectoryProfileFull[]; total: number }> {
  const serviceSupabase = createServiceClient(
    getSupabaseUrl(),
    getSupabaseServiceKey()
  );

  const offset = (page - 1) * limit;
  const { data, count } = await serviceSupabase
    .from("candidate_directory_profiles")
    .select("*, candidate_profile:candidate_profiles(full_name, phone, bio, website, linkedin_url)", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  return {
    profiles: (data ?? []) as CandidateDirectoryProfileFull[],
    total: count ?? 0,
  };
}

export async function getAuditLogs(
  filters: {
    actorType?: string;
    action?: string;
    candidateUserId?: string;
    employerId?: string;
  },
  page = 1,
  limit = 50
): Promise<{ logs: AuditLogWithDetails[]; total: number }> {
  const serviceSupabase = createServiceClient(
    getSupabaseUrl(),
    getSupabaseServiceKey()
  );

  let query = serviceSupabase
    .from("candidate_directory_audit_logs")
    .select("*", { count: "exact" });

  if (filters.actorType) {
    query = query.eq("actor_type", filters.actorType);
  }
  if (filters.action) {
    query = query.eq("action", filters.action);
  }
  if (filters.candidateUserId) {
    query = query.eq("candidate_user_id", filters.candidateUserId);
  }
  if (filters.employerId) {
    query = query.eq("employer_id", filters.employerId);
  }

  const offset = (page - 1) * limit;
  const { data, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  return {
    logs: (data ?? []) as AuditLogWithDetails[],
    total: count ?? 0,
  };
}
