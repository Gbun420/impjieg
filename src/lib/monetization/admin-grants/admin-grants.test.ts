import test from "node:test";
import assert from "node:assert/strict";
import { buildCommercialGrantAuditRecord } from "./audit";
import { buildAdminCommercialGrantInsertRow, calculateGrantCreditConsumption } from "./grant-helpers";
import { isEligibleAdminUser } from "./access";
import { createAdminCommercialGrantSchema } from "./validation";
import {
  resolveEmployerCommercialEntitlementsFromGrants,
  selectBestCommercialDiscount,
} from "./resolver";

test("admin grant schema rejects short reasons and invalid discount shapes", () => {
  const shortReason = createAdminCommercialGrantSchema.safeParse({
    employerId: "00000000-0000-4000-8000-000000000000",
    grantType: "free_trial",
    expiresAt: "2026-12-31T00:00:00.000Z",
    reason: "too short",
  });

  assert.equal(shortReason.success, false);

  const badDiscount = createAdminCommercialGrantSchema.safeParse({
    employerId: "00000000-0000-4000-8000-000000000000",
    grantType: "percent_discount",
    discountPercent: 25,
    discountAmountCents: 5000,
    reason: "Valid discount reason for a commercial grant",
  });

  assert.equal(badDiscount.success, false);
});

test("admin grant insert rows default to the signed-in admin and normalized values", () => {
  const payload = createAdminCommercialGrantSchema.parse({
    employerId: "00000000-0000-4000-8000-000000000000",
    grantType: "job_credit",
    creditsTotal: 3,
    reason: "Commercial goodwill for an urgent hiring campaign",
  });

  const row = buildAdminCommercialGrantInsertRow(payload, "admin-user-1");

  assert.equal(row.employer_id, "00000000-0000-4000-8000-000000000000");
  assert.equal(row.granted_by, "admin-user-1");
  assert.equal(row.grant_type, "job_credit");
  assert.equal(row.credits_total, 3);
  assert.equal(row.credits_used, 0);
  assert.equal(row.status, "active");
  assert.equal(row.currency, "eur");
});

test("credit consumption increments once and marks the grant consumed when exhausted", () => {
  const grant = {
    id: "grant-1",
    employer_id: "emp-1",
    granted_by: "admin-1",
    grant_type: "job_credit",
    product_id: null,
    entitlement_key: null,
    plan_key: null,
    credits_total: 2,
    credits_used: 1,
    discount_percent: null,
    discount_amount_cents: null,
    currency: "eur",
    starts_at: "2026-06-04T00:00:00.000Z",
    expires_at: null,
    status: "active",
    reason: "Support an urgent hiring campaign",
    internal_notes: null,
    revoked_at: null,
    revoked_by: null,
    revoke_reason: null,
    metadata: {},
    created_at: "2026-06-04T00:00:00.000Z",
    updated_at: "2026-06-04T00:00:00.000Z",
  } as const;

  const next = calculateGrantCreditConsumption(grant);

  assert.deepEqual(next, {
    nextCreditsUsed: 2,
    nextStatus: "consumed",
  });
});

test("credit consumption throws when credits are exhausted", () => {
  const grant = {
    id: "grant-1",
    employer_id: "emp-1",
    granted_by: "admin-1",
    grant_type: "featured_credit",
    product_id: null,
    entitlement_key: null,
    plan_key: null,
    credits_total: 1,
    credits_used: 1,
    discount_percent: null,
    discount_amount_cents: null,
    currency: "eur",
    starts_at: "2026-06-04T00:00:00.000Z",
    expires_at: null,
    status: "active",
    reason: "Support a featured listing",
    internal_notes: null,
    revoked_at: null,
    revoked_by: null,
    revoke_reason: null,
    metadata: {},
    created_at: "2026-06-04T00:00:00.000Z",
    updated_at: "2026-06-04T00:00:00.000Z",
  } as const;

  assert.throws(() => calculateGrantCreditConsumption(grant), /exhausted/);
});

test("entitlement resolver ignores revoked and expired grants", () => {
  const entitlements = resolveEmployerCommercialEntitlementsFromGrants(
    "emp-1",
    [
      {
        id: "plan-1",
        employer_id: "emp-1",
        granted_by: "admin-1",
        grant_type: "plan_access",
        product_id: null,
        entitlement_key: null,
        plan_key: "growth",
        credits_total: null,
        credits_used: 0,
        discount_percent: null,
        discount_amount_cents: null,
        currency: "eur",
        starts_at: "2026-06-04T00:00:00.000Z",
        expires_at: "2026-07-04T00:00:00.000Z",
        status: "active",
        reason: "Complimentary growth plan access",
        internal_notes: null,
        revoked_at: null,
        revoked_by: null,
        revoke_reason: null,
        metadata: {},
        created_at: "2026-06-04T00:00:00.000Z",
        updated_at: "2026-06-04T00:00:00.000Z",
      },
      {
        id: "job-credit-1",
        employer_id: "emp-1",
        granted_by: "admin-1",
        grant_type: "job_credit",
        product_id: null,
        entitlement_key: null,
        plan_key: null,
        credits_total: 4,
        credits_used: 2,
        discount_percent: null,
        discount_amount_cents: null,
        currency: "eur",
        starts_at: "2026-06-04T00:00:00.000Z",
        expires_at: "2026-07-04T00:00:00.000Z",
        status: "active",
        reason: "Support a hiring push",
        internal_notes: null,
        revoked_at: null,
        revoked_by: null,
        revoke_reason: null,
        metadata: {},
        created_at: "2026-06-04T00:00:00.000Z",
        updated_at: "2026-06-04T00:00:00.000Z",
      },
      {
        id: "boost-1",
        employer_id: "emp-1",
        granted_by: "admin-1",
        grant_type: "boost_credit",
        product_id: null,
        entitlement_key: null,
        plan_key: null,
        credits_total: 1,
        credits_used: 0,
        discount_percent: null,
        discount_amount_cents: null,
        currency: "eur",
        starts_at: "2026-06-04T00:00:00.000Z",
        expires_at: "2026-06-01T00:00:00.000Z",
        status: "active",
        reason: "Expired boost",
        internal_notes: null,
        revoked_at: null,
        revoked_by: null,
        revoke_reason: null,
        metadata: {},
        created_at: "2026-06-04T00:00:00.000Z",
        updated_at: "2026-06-04T00:00:00.000Z",
      },
      {
        id: "discount-1",
        employer_id: "emp-1",
        granted_by: "admin-1",
        grant_type: "fixed_discount",
        product_id: null,
        entitlement_key: null,
        plan_key: null,
        credits_total: null,
        credits_used: 0,
        discount_percent: null,
        discount_amount_cents: 5000,
        currency: "eur",
        starts_at: "2026-06-04T00:00:00.000Z",
        expires_at: null,
        status: "revoked",
        reason: "Revoked discount",
        internal_notes: null,
        revoked_at: "2026-06-04T00:00:00.000Z",
        revoked_by: "admin-1",
        revoke_reason: "No longer needed",
        metadata: {},
        created_at: "2026-06-04T00:00:00.000Z",
        updated_at: "2026-06-04T00:00:00.000Z",
      },
      {
        id: "custom-1",
        employer_id: "emp-1",
        granted_by: "admin-1",
        grant_type: "custom_entitlement",
        product_id: "custom-xyz",
        entitlement_key: "managed_shortlist_access",
        plan_key: null,
        credits_total: null,
        credits_used: 0,
        discount_percent: null,
        discount_amount_cents: null,
        currency: "eur",
        starts_at: "2026-06-04T00:00:00.000Z",
        expires_at: "2026-07-04T00:00:00.000Z",
        status: "active",
        reason: "Managed shortlist support",
        internal_notes: "Only visible to admins",
        revoked_at: null,
        revoked_by: null,
        revoke_reason: null,
        metadata: {},
        created_at: "2026-06-04T00:00:00.000Z",
        updated_at: "2026-06-04T00:00:00.000Z",
      },
    ] as never[],
    new Date("2026-06-04T12:00:00.000Z")
  );

  assert.equal(entitlements.employerId, "emp-1");
  assert.equal(entitlements.activePlan?.planKey, "growth");
  assert.equal(entitlements.credits.job.remaining, 2);
  assert.equal(entitlements.credits.boost.remaining, 0);
  assert.equal(entitlements.discounts.length, 0);
  assert.equal(entitlements.customEntitlements.length, 1);
  assert.equal(entitlements.sourceGrantIds.includes("boost-1"), false);
});

test("best discount selection prefers the highest value", () => {
  const result = selectBestCommercialDiscount(
    [
      {
        grantId: "discount-percent",
        grantType: "percent_discount",
        discountPercent: 20,
        discountAmountCents: null,
        currency: "eur",
        reason: "Percent discount",
        expiresAt: null,
      },
      {
        grantId: "discount-fixed",
        grantType: "fixed_discount",
        discountPercent: null,
        discountAmountCents: 3000,
        currency: "eur",
        reason: "Fixed discount",
        expiresAt: null,
      },
    ],
    12000
  );

  assert.equal(result.discount?.grantId, "discount-fixed");
  assert.equal(result.discountCents, 3000);
  assert.equal(result.discountedTotalCents, 9000);
});

test("commercial grant audit records redact sensitive metadata", () => {
  const record = buildCommercialGrantAuditRecord({
    grantId: "grant-1",
    employerId: "emp-1",
    actorId: "admin-1",
    action: "grant_created",
    metadata: {
      reason: "Commercial grant",
      stripeSecret: "sk_test_123",
      nested: { apiKey: "key-123", keep: true },
    },
  });

  assert.equal(record.action, "grant_created");
  assert.equal((record.metadata as Record<string, unknown>).stripeSecret, "[redacted]");
  assert.equal(
    ((record.metadata as Record<string, unknown>).nested as Record<string, unknown>).apiKey,
    "[redacted]"
  );
});

test("eligible admin users are matched by role metadata and email allowlist", () => {
  assert.equal(
    isEligibleAdminUser({
      id: "admin-1",
      email: "Admin@Example.com",
      app_metadata: { role: "admin" },
    }),
    false
  );

  assert.equal(
    isEligibleAdminUser({
      id: "admin-2",
      email: "info@dopaminedigital.co",
      app_metadata: { role: "admin" },
    }),
    true
  );
});
