import {
  ACTIVE_GRANT_STATUSES,
  CREDIT_GRANT_TYPES,
  DISCOUNT_GRANT_TYPES,
  PLAN_KEY_PRIORITY,
  PLAN_GRANT_TYPES,
} from "./constants";
import type {
  AdminCommercialGrantRow,
  ResolvedCommercialCreditBucket,
  ResolvedCommercialDiscount,
  ResolvedCommercialPlan,
  ResolvedEmployerCommercialEntitlements,
} from "./types";

const CREDIT_BUCKETS = {
  job_credit: "job",
  featured_credit: "featured",
  boost_credit: "boost",
  ai_screening_credit: "aiScreening",
} as const;

type CreditBucketKey = keyof typeof CREDIT_BUCKETS;
type CreditBucketName = (typeof CREDIT_BUCKETS)[CreditBucketKey];

function isActiveGrant(grant: AdminCommercialGrantRow, now: Date) {
  if (!ACTIVE_GRANT_STATUSES.includes(grant.status as (typeof ACTIVE_GRANT_STATUSES)[number])) {
    return false;
  }

  if (grant.expires_at && new Date(grant.expires_at).getTime() <= now.getTime()) {
    return false;
  }

  return true;
}

function getCreditRemaining(grant: AdminCommercialGrantRow) {
  if (!grant.credits_total) {
    return 0;
  }

  return Math.max(0, grant.credits_total - grant.credits_used);
}

function toDiscount(grant: AdminCommercialGrantRow): ResolvedCommercialDiscount {
  return {
    grantId: grant.id,
    grantType: grant.grant_type as "percent_discount" | "fixed_discount",
    discountPercent: grant.discount_percent,
    discountAmountCents: grant.discount_amount_cents,
    currency: grant.currency ?? "eur",
    reason: grant.reason,
    expiresAt: grant.expires_at,
  };
}

function getPlanPriority(grant: AdminCommercialGrantRow) {
  const planKey = grant.plan_key ?? "";
  return PLAN_KEY_PRIORITY[planKey] ?? 0;
}

function getExpiryTime(expiresAt: string | null) {
  return expiresAt ? new Date(expiresAt).getTime() : Number.POSITIVE_INFINITY;
}

function buildEmptyCreditBucket(): ResolvedCommercialCreditBucket {
  return {
    total: 0,
    remaining: 0,
    expiresAt: null,
    sourceGrantIds: [],
  };
}

export function resolveEmployerCommercialEntitlementsFromGrants(
  employerId: string,
  grants: AdminCommercialGrantRow[],
  now = new Date()
): ResolvedEmployerCommercialEntitlements {
  const activeGrants = grants.filter((grant) => isActiveGrant(grant, now));
  const sourceGrantIds = activeGrants.map((grant) => grant.id);

  const planGrants = activeGrants
    .filter((grant) => PLAN_GRANT_TYPES.includes(grant.grant_type as (typeof PLAN_GRANT_TYPES)[number]))
    .sort((left, right) => {
      const priorityDelta = getPlanPriority(right) - getPlanPriority(left);
      if (priorityDelta !== 0) {
        return priorityDelta;
      }

      return getExpiryTime(right.expires_at) - getExpiryTime(left.expires_at);
    });

  const activePlanGrant = planGrants[0] ?? null;
  const activePlan: ResolvedCommercialPlan | null = activePlanGrant
    ? {
        grantId: activePlanGrant.id,
        grantType: activePlanGrant.grant_type as "free_trial" | "plan_access",
        planKey: activePlanGrant.plan_key,
        expiresAt: activePlanGrant.expires_at,
        reason: activePlanGrant.reason,
      }
    : null;

  const bucketMap = new Map<CreditBucketName, ResolvedCommercialCreditBucket>();
  for (const bucket of Object.values(CREDIT_BUCKETS)) {
    bucketMap.set(bucket, buildEmptyCreditBucket());
  }

  for (const grant of activeGrants) {
    if (!CREDIT_GRANT_TYPES.includes(grant.grant_type as (typeof CREDIT_GRANT_TYPES)[number])) {
      continue;
    }

    const bucketKey = CREDIT_BUCKETS[grant.grant_type as CreditBucketKey];
    const current = bucketMap.get(bucketKey) ?? buildEmptyCreditBucket();
    const remaining = getCreditRemaining(grant);

    bucketMap.set(bucketKey, {
      total: current.total + (grant.credits_total ?? 0),
      remaining: current.remaining + remaining,
      expiresAt:
        current.expiresAt === null
          ? grant.expires_at
          : getExpiryTime(grant.expires_at) < getExpiryTime(current.expiresAt)
            ? grant.expires_at
            : current.expiresAt,
      sourceGrantIds: [...current.sourceGrantIds, grant.id],
    });
  }

  const discounts: ResolvedCommercialDiscount[] = activeGrants
    .filter((grant) => DISCOUNT_GRANT_TYPES.includes(grant.grant_type as (typeof DISCOUNT_GRANT_TYPES)[number]))
    .map(toDiscount)
    .sort((left, right) => {
      const percentDelta = (right.discountPercent ?? 0) - (left.discountPercent ?? 0);
      if (percentDelta !== 0) {
        return percentDelta;
      }

      return (right.discountAmountCents ?? 0) - (left.discountAmountCents ?? 0);
    });

  const customEntitlements = activeGrants
    .filter((grant) => grant.grant_type === "custom_entitlement")
    .map((grant) => ({
      grantId: grant.id,
      entitlementKey: grant.entitlement_key,
      productId: grant.product_id,
      expiresAt: grant.expires_at,
      reason: grant.reason,
    }));

  return {
    employerId,
    activePlan,
    credits: {
      job: bucketMap.get("job") ?? buildEmptyCreditBucket(),
      featured: bucketMap.get("featured") ?? buildEmptyCreditBucket(),
      boost: bucketMap.get("boost") ?? buildEmptyCreditBucket(),
      aiScreening: bucketMap.get("aiScreening") ?? buildEmptyCreditBucket(),
    },
    discounts,
    customEntitlements,
    sourceGrantIds,
  };
}

export function selectBestCommercialDiscount(
  discounts: ResolvedCommercialDiscount[],
  subtotalCents: number
) {
  let bestDiscount: ResolvedCommercialDiscount | null = null;
  let bestValue = 0;

  for (const discount of discounts) {
    const value =
      discount.discountPercent != null
        ? Math.floor((subtotalCents * discount.discountPercent) / 100)
        : discount.discountAmountCents ?? 0;

    if (value > bestValue) {
      bestValue = value;
      bestDiscount = discount;
    }
  }

  return {
    discount: bestDiscount,
    discountCents: Math.min(bestValue, subtotalCents),
    discountedTotalCents: Math.max(subtotalCents - Math.min(bestValue, subtotalCents), 0),
  };
}
