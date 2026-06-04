import { z } from "zod";
import {
  CREDIT_GRANT_TYPES,
  DISCOUNT_GRANT_TYPES,
  GRANT_STATUSES,
  GRANT_TYPES,
  PLAN_GRANT_TYPES,
} from "./constants";

const grantFieldsSchema = z.object({
  employerId: z.string().uuid(),
  grantType: z.enum(GRANT_TYPES),
  productId: z.string().trim().min(1).max(200).nullable().optional(),
  entitlementKey: z.string().trim().min(1).max(200).nullable().optional(),
  planKey: z.string().trim().min(1).max(200).nullable().optional(),
  creditsTotal: z.coerce.number().int().positive().nullable().optional(),
  discountPercent: z.coerce.number().min(1).max(100).nullable().optional(),
  discountAmountCents: z.coerce.number().int().positive().nullable().optional(),
  currency: z.string().trim().length(3).default("eur"),
  startsAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
  status: z.enum(GRANT_STATUSES).default("active"),
  reason: z.string().trim().min(10).max(2000),
  internalNotes: z.string().trim().max(4000).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

function validateGrantShape(
  payload: z.infer<typeof grantFieldsSchema>,
  ctx: z.RefinementCtx
) {
  const isCreditGrant = CREDIT_GRANT_TYPES.includes(
    payload.grantType as (typeof CREDIT_GRANT_TYPES)[number]
  );
  const isDiscountGrant = DISCOUNT_GRANT_TYPES.includes(
    payload.grantType as (typeof DISCOUNT_GRANT_TYPES)[number]
  );
  const isPlanGrant = PLAN_GRANT_TYPES.includes(
    payload.grantType as (typeof PLAN_GRANT_TYPES)[number]
  );

  if (isPlanGrant && !payload.expiresAt) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["expiresAt"],
      message: "Plan grants require an expiry date.",
    });
  }

  if (isCreditGrant && !payload.creditsTotal) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["creditsTotal"],
      message: "Credit grants require a total credit amount.",
    });
  }

  if (isDiscountGrant) {
    const hasPercent = payload.discountPercent != null;
    const hasAmount = payload.discountAmountCents != null;

    if (hasPercent === hasAmount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["discountPercent"],
        message: "Discount grants require either a percent or a fixed amount, but not both.",
      });
    }
  }

  if (!isDiscountGrant && (payload.discountPercent != null || payload.discountAmountCents != null)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["grantType"],
      message: "Only discount grants can define discount values.",
    });
  }

  if (!isCreditGrant && payload.creditsTotal != null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["grantType"],
      message: "Only credit grants can define credits.",
    });
  }

  if (payload.expiresAt && payload.startsAt && payload.expiresAt <= payload.startsAt) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["expiresAt"],
      message: "Expiry must be after the start date.",
    });
  }
}

export const createAdminCommercialGrantSchema = grantFieldsSchema
  .superRefine(validateGrantShape)
  .transform((payload) => ({
    ...payload,
    startsAt: payload.startsAt ?? new Date(),
  }));

export const updateAdminCommercialGrantSchema = grantFieldsSchema
  .partial()
  .extend({
    grantId: z.string().uuid(),
  })
  .superRefine((payload, ctx) => {
    if (payload.reason != null && payload.reason.trim().length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["reason"],
        message: "Reason must be at least 10 characters long.",
      });
    }

    if (payload.grantType) {
      validateGrantShape(
        {
          employerId: payload.employerId ?? "",
          grantType: payload.grantType,
          productId: payload.productId ?? null,
          entitlementKey: payload.entitlementKey ?? null,
          planKey: payload.planKey ?? null,
          creditsTotal: payload.creditsTotal ?? null,
          discountPercent: payload.discountPercent ?? null,
          discountAmountCents: payload.discountAmountCents ?? null,
          currency: payload.currency ?? "eur",
          startsAt: payload.startsAt,
          expiresAt: payload.expiresAt,
          status: payload.status ?? "active",
          reason: payload.reason ?? "updated grant",
          internalNotes: payload.internalNotes ?? null,
          metadata: payload.metadata ?? {},
        },
        ctx
      );
    }
  });

export const revokeAdminCommercialGrantSchema = z.object({
  grantId: z.string().uuid(),
  reason: z.string().trim().min(10).max(2000),
});

export const consumeGrantCreditSchema = z.object({
  grantId: z.string().uuid(),
  context: z.record(z.string(), z.unknown()).default({}),
});

export const resolveEmployerEntitlementsSchema = z.object({
  employerId: z.string().uuid(),
});

