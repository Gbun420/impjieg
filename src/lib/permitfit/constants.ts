export const TCN_SUPPORT_LEVELS = [
  { value: "none", label: "No TCN support" },
  { value: "already_in_malta_only", label: "TCNs already in Malta only" },
  { value: "change_of_employer_supported", label: "Change of employer supported" },
  { value: "first_time_single_permit_supported", label: "First-time Single Permit supported" },
  { value: "full_relocation_supported", label: "Full relocation support" },
] as const;

export const PERMIT_ROUTES_SUPPORTED = [
  { value: "single_permit", label: "Single Permit" },
  { value: "change_of_employer", label: "Change of employer" },
  { value: "kei", label: "Key Employee Initiative" },
  { value: "sei", label: "Specialist Employee Initiative" },
  { value: "seasonal", label: "Seasonal work" },
  { value: "student_or_intern", label: "Student / internship route" },
] as const;

export const CANDIDATE_WORK_STATUS_OPTIONS = [
  { value: "maltese_or_eu", label: "Maltese / EU citizen" },
  { value: "tcn_in_malta_with_valid_permit", label: "TCN in Malta with valid permit" },
  { value: "tcn_in_malta_needs_change_of_employer", label: "TCN in Malta needing change of employer" },
  { value: "tcn_outside_malta_needs_first_time_permit", label: "TCN outside Malta needing first-time permit" },
  { value: "student_or_other_status", label: "Student or other status" },
  { value: "unknown", label: "Not sure" },
] as const;

export const PRE_DEPARTURE_COURSE_OPTIONS = [
  { value: "not_required_or_unknown", label: "Not required / not sure" },
  { value: "not_started", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
] as const;

export const PERMITFIT_DISCLAIMER =
  "PermitFit uses employer-declared and candidate-declared information. Impjieg does not provide immigration advice, legal advice, or official approval.";

export type TcnSupportLevel = (typeof TCN_SUPPORT_LEVELS)[number]["value"];
export type PermitRouteSupported = (typeof PERMIT_ROUTES_SUPPORTED)[number]["value"];
export type CandidateWorkStatus = (typeof CANDIDATE_WORK_STATUS_OPTIONS)[number]["value"];
export type PreDepartureCourseStatus = (typeof PRE_DEPARTURE_COURSE_OPTIONS)[number]["value"];
