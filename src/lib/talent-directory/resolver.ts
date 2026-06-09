import type { EmployerVisibleProfile, ContactRequestWithDetails } from "./types";

// ============================================================================
// Visibility Resolver
// ============================================================================

/** Build the employer-visible display name based on display_mode */
export function resolveDisplayName(
  profile: EmployerVisibleProfile,
  fullName?: string | null
): string {
  switch (profile.display_mode) {
    case "full_name":
      return fullName ?? "Candidate";
    case "first_name":
      return fullName?.split(" ")[0] ?? "Candidate";
    case "anonymous":
    default:
      return "Candidate";
  }
}

/** Check if candidate has an existing pending request from this employer */
export function hasExistingPendingRequest(
  requests: ContactRequestWithDetails[],
  employerId: string
): boolean {
  return requests.some(
    (r) => r.employer_id === employerId && r.status === "pending"
  );
}

// ============================================================================
// Credit Resolver
// ============================================================================

/** Check if employer can make a new contact request */
export function canMakeContactRequest(
  creditsRemaining: number,
  pendingRequests: number,
  maxPending = 5
): { allowed: boolean; reason?: string } {
  if (creditsRemaining <= 0) {
    return { allowed: false, reason: "No contact credits remaining" };
  }
  if (pendingRequests >= maxPending) {
    return {
      allowed: false,
      reason: `Maximum ${maxPending} pending requests allowed`,
    };
  }
  return { allowed: true };
}

/** Calculate monthly credit reset amount based on plan */
export function getMonthlyCreditAllocation(planKey: string): number {
  switch (planKey) {
    case "starter":
      return 10;
    case "recruiter":
      return 30;
    default:
      return 0;
  }
}
