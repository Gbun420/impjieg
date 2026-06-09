// ============================================================================
// Legal Document Constants
// ============================================================================

export const LEGAL_DOCUMENTS = [
  {
    slug: "terms-of-service",
    title: "Terms of Service",
    description: "Platform terms governing use of Impjieg",
    audience: "all" as const,
    publicUrl: "/terms",
  },
  {
    slug: "privacy-notice",
    title: "Privacy Notice",
    description: "GDPR privacy policy for Impjieg",
    audience: "all" as const,
    publicUrl: "/privacy",
  },
  {
    slug: "cookie-notice",
    title: "Cookie Notice",
    description: "ePrivacy cookie policy",
    audience: "all" as const,
    publicUrl: "/cookies",
  },
  {
    slug: "candidate-terms",
    title: "Candidate Terms",
    description: "Additional terms for job seekers",
    audience: "candidate" as const,
    publicUrl: "/legal/candidate-terms",
  },
  {
    slug: "employer-terms",
    title: "Employer Terms",
    description: "Additional terms for employers",
    audience: "employer" as const,
    publicUrl: "/legal/employer-terms",
  },
  {
    slug: "application-processing-notice",
    title: "Application Processing Notice",
    description: "Notice about job application data processing",
    audience: "applicant" as const,
    publicUrl: "/legal/application-processing",
  },
  {
    slug: "talent-directory-consent",
    title: "Talent Directory Consent",
    description: "Consent for Talent Directory visibility",
    audience: "candidate" as const,
    publicUrl: "/legal/talent-directory-consent",
  },
] as const;

export type LegalDocumentSlug = (typeof LEGAL_DOCUMENTS)[number]["slug"];

// ============================================================================
// Current Document Versions
// ============================================================================

export const CURRENT_LEGAL_VERSIONS: Record<LegalDocumentSlug, string> = {
  "terms-of-service": "2026-01",
  "privacy-notice": "2026-01",
  "cookie-notice": "2026-01",
  "candidate-terms": "2026-01",
  "employer-terms": "2026-01",
  "application-processing-notice": "2026-01",
  "talent-directory-consent": "2026-01",
};

// ============================================================================
// Consent Text Snapshots
// ============================================================================

export const CONSENT_TEXT = {
  terms: "I agree to the Impjieg Terms of Service.",
  privacy:
    "I have read the Impjieg Privacy Notice and understand how my data will be processed.",
  marketing:
    "I agree to receive product updates and relevant hiring/recruitment offers from Impjieg. I can unsubscribe at any time.",
  applicationProcessing:
    "I understand that my application details will be shared with the employer for recruitment purposes.",
  talentDirectory:
    "I agree to make my Talent Directory profile visible to verified employers under my selected visibility settings.",
} as const;

// ============================================================================
// Event Types
// ============================================================================

export const LEGAL_EVENT_TYPES = {
  SIGNUP_CANDIDATE: "account_signup_candidate",
  SIGNUP_EMPLOYER: "account_signup_employer",
  JOB_APPLICATION: "job_application_submitted",
  CHECKOUT_COMPLETED: "employer_checkout_completed",
  TALENT_DIRECTORY_OPT_IN: "talent_directory_opt_in",
  TALENT_DIRECTORY_OPT_OUT: "talent_directory_opt_out",
} as const;

// ============================================================================
// Env Vars
// ============================================================================

export const LEGAL_ARCHIVE_EMAIL =
  process.env.LEGAL_ARCHIVE_EMAIL || "legal@impjieg.com";
export const DATA_PROTECTION_EMAIL =
  process.env.DATA_PROTECTION_EMAIL || "dpo@impjieg.com";
export const SUPPORT_EMAIL =
  process.env.SUPPORT_EMAIL || "support@impjieg.com";
export const LEGAL_RECEIPTS_ENABLED =
  process.env.LEGAL_RECEIPTS_ENABLED !== "false";
