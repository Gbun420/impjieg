export const GRANT_TYPES = [
  "free_trial",
  "plan_access",
  "job_credit",
  "featured_credit",
  "boost_credit",
  "ai_screening_credit",
  "percent_discount",
  "fixed_discount",
  "custom_entitlement",
] as const;

export const GRANT_STATUSES = [
  "active",
  "expired",
  "revoked",
  "consumed",
] as const;

export const CREDIT_GRANT_TYPES = [
  "job_credit",
  "featured_credit",
  "boost_credit",
  "ai_screening_credit",
] as const;

export const DISCOUNT_GRANT_TYPES = [
  "percent_discount",
  "fixed_discount",
] as const;

export const PLAN_GRANT_TYPES = [
  "free_trial",
  "plan_access",
] as const;

export const GRANT_ACTIONS = [
  "grant_created",
  "grant_updated",
  "grant_revoked",
  "grant_expired",
  "grant_consumed",
  "credit_used",
  "discount_applied",
] as const;

export const CREDIT_GRANT_TO_ENTITLEMENT_KEY = {
  job_credit: "job_posting_credit",
  featured_credit: "featured_listing_credit",
  boost_credit: "boost_credit",
  ai_screening_credit: "ai_screening_credit",
} as const;

export const PLAN_KEY_PRIORITY: Record<string, number> = {
  basic: 1,
  starter: 1,
  professional: 2,
  growth: 2,
  enterprise: 3,
  scale: 3,
};

export const ACTIVE_GRANT_STATUSES = ["active"] as const;
