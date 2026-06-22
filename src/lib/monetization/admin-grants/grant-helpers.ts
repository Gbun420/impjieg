import type { Json } from "@/lib/supabase/types";
import type { AdminCommercialGrantRow } from "./types";
import type { createAdminCommercialGrantSchema } from "./validation";

// Pure helpers for commercial grants. These live outside the "use server"
// actions module so they can stay synchronous (a "use server" file may only
// export async Server Actions) and be unit-tested directly.

export function buildAdminCommercialGrantInsertRow(
  payload: ReturnType<typeof createAdminCommercialGrantSchema.parse>,
  grantedBy: string
) {
  return {
    employer_id: payload.employerId,
    granted_by: grantedBy,
    grant_type: payload.grantType,
    product_id: payload.productId ?? null,
    entitlement_key: payload.entitlementKey ?? null,
    plan_key: payload.planKey ?? null,
    credits_total: payload.creditsTotal ?? null,
    credits_used: 0,
    discount_percent: payload.discountPercent ?? null,
    discount_amount_cents: payload.discountAmountCents ?? null,
    currency: payload.currency,
    starts_at: payload.startsAt.toISOString(),
    expires_at: payload.expiresAt?.toISOString() ?? null,
    status: payload.status,
    reason: payload.reason,
    internal_notes: payload.internalNotes ?? null,
    metadata: payload.metadata as Json,
  };
}

export function calculateGrantCreditConsumption(grant: AdminCommercialGrantRow) {
  const creditsTotal = grant.credits_total ?? 0;
  const nextCreditsUsed = grant.credits_used + 1;

  if (creditsTotal <= 0 || nextCreditsUsed > creditsTotal) {
    throw new Error("Grant credits have been exhausted");
  }

  return {
    nextCreditsUsed,
    nextStatus:
      nextCreditsUsed >= creditsTotal ? ("consumed" as const) : ("active" as const),
  };
}
