// ============================================================================
// Table Row Types (using any until migration is applied)
// ============================================================================

export type CandidateDirectoryProfile = {
  id: string;
  candidate_user_id: string;
  slug: string;
  display_mode: string;
  visibility_status: string;
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
  allow_contact_requests: boolean;
  allow_cv_requests: boolean;
  consent_to_directory: boolean;
  consent_recorded_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CandidateDirectoryProfileInsert = Omit<CandidateDirectoryProfile, "id" | "created_at" | "updated_at">;
export type CandidateDirectoryProfileUpdate = Partial<CandidateDirectoryProfileInsert>;

export type CandidateDirectoryCvAsset = {
  id: string;
  profile_id: string;
  file_url: string;
  file_name: string;
  file_size_bytes: number | null;
  mime_type: string | null;
  created_at: string;
};

export type CandidateDirectoryCvAssetInsert = Omit<CandidateDirectoryCvAsset, "id" | "created_at">;

export type EmployerTalentAccess = {
  id: string;
  employer_id: string;
  plan_key: string;
  credits_total: number;
  credits_used: number;
  status: string;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
};

export type EmployerTalentAccessInsert = Omit<EmployerTalentAccess, "id" | "created_at" | "updated_at">;
export type EmployerTalentAccessUpdate = Partial<EmployerTalentAccessInsert>;

export type CandidateContactRequest = {
  id: string;
  candidate_user_id: string;
  employer_id: string;
  directory_profile_id: string;
  status: string;
  message: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CandidateContactRequestInsert = Omit<CandidateContactRequest, "id" | "created_at" | "updated_at">;
export type CandidateContactRequestUpdate = Partial<CandidateContactRequestInsert>;

export type CandidateDirectoryAuditLog = {
  id: string;
  candidate_user_id: string;
  employer_id: string | null;
  action: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type CandidateDirectoryAuditLogInsert = Omit<CandidateDirectoryAuditLog, "id" | "created_at">;

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
