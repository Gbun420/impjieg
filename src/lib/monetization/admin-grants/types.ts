import type { Database } from "@/lib/supabase/types";
import type { Employer } from "@/lib/supabase/types";

export type AdminCommercialGrantRow =
  Database["public"]["Tables"]["admin_commercial_grants"]["Row"];

export type AdminCommercialGrantInsert =
  Database["public"]["Tables"]["admin_commercial_grants"]["Insert"];

export type AdminCommercialGrantUpdate =
  Database["public"]["Tables"]["admin_commercial_grants"]["Update"];

export type AdminCommercialGrantAuditLogRow =
  Database["public"]["Tables"]["admin_commercial_grant_audit_logs"]["Row"];

export type AdminCommercialGrantAuditLogInsert =
  Database["public"]["Tables"]["admin_commercial_grant_audit_logs"]["Insert"];

export type EmployerVisibleCommercialGrant = Omit<
  AdminCommercialGrantRow,
  "internal_notes" | "granted_by" | "revoked_by"
>;

export type GrantAction =
  | "grant_created"
  | "grant_updated"
  | "grant_revoked"
  | "grant_expired"
  | "grant_consumed"
  | "credit_used"
  | "discount_applied";

export type ResolvedCommercialDiscount = {
  grantId: string;
  grantType: "percent_discount" | "fixed_discount";
  discountPercent: number | null;
  discountAmountCents: number | null;
  currency: string;
  reason: string;
  expiresAt: string | null;
};

export type ResolvedCommercialCreditBucket = {
  total: number;
  remaining: number;
  expiresAt: string | null;
  sourceGrantIds: string[];
};

export type ResolvedCommercialPlan = {
  grantId: string;
  grantType: "free_trial" | "plan_access";
  planKey: string | null;
  expiresAt: string | null;
  reason: string;
};

export type ResolvedEmployerCommercialEntitlements = {
  employerId: string;
  activePlan: ResolvedCommercialPlan | null;
  credits: {
    job: ResolvedCommercialCreditBucket;
    featured: ResolvedCommercialCreditBucket;
    boost: ResolvedCommercialCreditBucket;
    aiScreening: ResolvedCommercialCreditBucket;
  };
  discounts: ResolvedCommercialDiscount[];
  customEntitlements: Array<{
    grantId: string;
    entitlementKey: string | null;
    productId: string | null;
    expiresAt: string | null;
    reason: string;
  }>;
  sourceGrantIds: string[];
};

export type AdminCommercialGrantEmployerOption = Pick<
  Employer,
  "id" | "name" | "slug"
>;
