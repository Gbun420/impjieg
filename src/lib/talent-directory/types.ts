import type { Database } from "@/lib/supabase/types";

// ============================================================================
// Table Row Types (derived from Supabase schema)
// ============================================================================

export type CandidateDirectoryProfile =
  Database["public"]["Tables"]["candidate_directory_profiles"]["Row"];
export type CandidateDirectoryProfileInsert =
  Database["public"]["Tables"]["candidate_directory_profiles"]["Insert"];
export type CandidateDirectoryProfileUpdate =
  Database["public"]["Tables"]["candidate_directory_profiles"]["Update"];

export type CandidateDirectoryCvAsset =
  Database["public"]["Tables"]["candidate_directory_cv_assets"]["Row"];
export type CandidateDirectoryCvAssetInsert =
  Database["public"]["Tables"]["candidate_directory_cv_assets"]["Insert"];

export type EmployerTalentAccess =
  Database["public"]["Tables"]["employer_talent_access"]["Row"];
export type EmployerTalentAccessInsert =
  Database["public"]["Tables"]["employer_talent_access"]["Insert"];
export type EmployerTalentAccessUpdate =
  Database["public"]["Tables"]["employer_talent_access"]["Update"];

export type CandidateContactRequest =
  Database["public"]["Tables"]["candidate_contact_requests"]["Row"];
export type CandidateContactRequestInsert =
  Database["public"]["Tables"]["candidate_contact_requests"]["Insert"];
export type CandidateContactRequestUpdate =
  Database["public"]["Tables"]["candidate_contact_requests"]["Update"];

export type CandidateDirectoryAuditLog =
  Database["public"]["Tables"]["candidate_directory_audit_logs"]["Row"];
export type CandidateDirectoryAuditLogInsert =
  Database["public"]["Tables"]["candidate_directory_audit_logs"]["Insert"];

// ============================================================================
// Derived Types
// ============================================================================

/** Safe profile visible to employers (no PII) */
export type EmployerVisibleProfile = {
  id: string;
  slug: string;
  display_mode: string;
  headline: string | null;
  summary: string | null;
  location: string | null;
  skills: string[];
  sectors: string[];
  job_types: string[];
  remote_preference: string | null;
  experience_years: number | null;
  desired_salary_min: number | null;
  desired_salary_max: number | null;
  availability: string | null;
  allow_cv_requests: boolean;
  created_at: string;
};

/** Candidate's own directory profile (full access) */
export type CandidateDirectoryProfileFull = CandidateDirectoryProfile & {
  candidate_profile?: {
    full_name: string | null;
    phone: string | null;
    bio: string | null;
    website: string | null;
    linkedin_url: string | null;
  } | null;
};

/** Contact request with joined data */
export type ContactRequestWithDetails = CandidateContactRequest & {
  employer?: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    location: string | null;
  } | null;
  directory_profile?: {
    id: string;
    slug: string;
    headline: string | null;
    display_mode: string;
  } | null;
};

/** Employer talent access with employer info */
export type TalentAccessWithEmployer = EmployerTalentAccess & {
  employer?: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
  } | null;
};

/** Directory search result */
export type DirectorySearchResult = {
  profiles: EmployerVisibleProfile[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

/** Directory overview stats (for admin) */
export type DirectoryOverviewStats = {
  totalProfiles: number;
  searchableProfiles: number;
  pausedProfiles: number;
  privateProfiles: number;
  activeEmployers: number;
  totalContactRequests: number;
  pendingRequests: number;
  creditsConsumed: number;
};

/** Credit balance info */
export type CreditBalance = {
  total: number;
  used: number;
  remaining: number;
  planKey: string;
  status: string;
};

/** Audit log with actor info */
export type AuditLogWithDetails = CandidateDirectoryAuditLog & {
  candidate?: {
    id: string;
    email: string;
  } | null;
  employer?: {
    id: string;
    name: string;
  } | null;
};
