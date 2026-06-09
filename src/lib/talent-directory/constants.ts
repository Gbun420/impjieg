import { z } from "zod";

// ============================================================================
// Feature Flag
// ============================================================================

export const TALENT_DIRECTORY_ENABLED =
  process.env.CV_DIRECTORY_ENABLED === "true";

// ============================================================================
// Consent Version
// ============================================================================

export const TALENT_DIRECTORY_CONSENT_VERSION = "1.0";

// ============================================================================
// Visibility Status
// ============================================================================

export const VISIBILITY_STATUSES = ["private", "searchable", "paused"] as const;
export type VisibilityStatus = (typeof VISIBILITY_STATUSES)[number];

// ============================================================================
// Display Mode
// ============================================================================

export const DISPLAY_MODES = ["anonymous", "first_name", "full_name"] as const;
export type DisplayMode = (typeof DISPLAY_MODES)[number];

// ============================================================================
// Contact Request Status
// ============================================================================

export const CONTACT_REQUEST_STATUSES = [
  "pending",
  "accepted",
  "rejected",
  "expired",
  "cancelled",
] as const;
export type ContactRequestStatus = (typeof CONTACT_REQUEST_STATUSES)[number];

// ============================================================================
// Talent Directory Plans
// ============================================================================

export const TALENT_DIRECTORY_PLANS = {
  starter: {
    label: "Talent Starter",
    price: 49,
    contactCreditsPerMonth: 10,
    features: [
      "Searchable talent directory",
      "10 contact credits per month",
      "Basic filters",
      "Contact candidates through Impjieg",
    ],
  },
  recruiter: {
    label: "Talent Recruiter",
    price: 99,
    contactCreditsPerMonth: 30,
    features: [
      "Searchable talent directory",
      "30 contact credits per month",
      "Advanced filters",
      "Saved candidates",
      "Contact candidates through Impjieg",
    ],
  },
} as const;

export type TalentPlanKey = keyof typeof TALENT_DIRECTORY_PLANS;

// ============================================================================
// Talent Directory Credit Packs
// ============================================================================

export const TALENT_DIRECTORY_CREDIT_PACKS = {
  "5": { label: "5 Credits", price: 19, credits: 5 },
  "20": { label: "20 Credits", price: 49, credits: 20 },
  "50": { label: "50 Credits", price: 99, credits: 50 },
} as const;

export type TalentCreditPackKey = keyof typeof TALENT_DIRECTORY_CREDIT_PACKS;

// ============================================================================
// Audit Actions
// ============================================================================

export const TALENT_DIRECTORY_AUDIT_ACTIONS = [
  "candidate_opted_in",
  "candidate_paused_visibility",
  "candidate_left_directory",
  "candidate_refreshed_profile",
  "employer_access_created",
  "employer_access_expired",
  "contact_request_created",
  "contact_request_accepted",
  "contact_request_rejected",
  "contact_request_cancelled",
  "credit_consumed",
  "credit_reserved",
  "employer_suspended",
  "abuse_report_created",
  "admin_note_added",
] as const;

export type TalentDirectoryAuditAction =
  (typeof TALENT_DIRECTORY_AUDIT_ACTIONS)[number];

// ============================================================================
// Limits
// ============================================================================

export const TALENT_DIRECTORY_MAX_SKILLS = 30;
export const TALENT_DIRECTORY_MAX_SECTORS = 10;
export const TALENT_DIRECTORY_MAX_HEADLINE = 140;
export const TALENT_DIRECTORY_MAX_SUMMARY = 1000;
export const TALENT_DIRECTORY_MAX_MESSAGE = 2000;
export const TALENT_DIRECTORY_MIN_MESSAGE = 30;
export const TALENT_DIRECTORY_MAX_REQUESTS_PER_DAY = 20;
