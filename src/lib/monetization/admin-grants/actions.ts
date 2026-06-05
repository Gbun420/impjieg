"use server";

import { revalidatePath } from "next/cache";
import { hasValidAdminSession } from "@/lib/admin-session";
import { createAdminGrantsServiceClient, getCurrentUserOrThrow, assertAdminUser, assertEmployerOwnsGrant, isEligibleAdminUser, AuthorizationError } from "./access";
import { logCommercialGrantAction } from "./audit";
import {
  CREDIT_GRANT_TYPES,
  DISCOUNT_GRANT_TYPES,
  GRANT_STATUSES,
} from "./constants";
import {
  consumeGrantCreditSchema,
  createAdminCommercialGrantSchema,
  revokeAdminCommercialGrantSchema,
  resolveEmployerEntitlementsSchema,
  updateAdminCommercialGrantSchema,
} from "./validation";
import {
  resolveEmployerCommercialEntitlementsFromGrants,
  selectBestCommercialDiscount,
} from "./resolver";
import type {
  AdminCommercialGrantRow,
  AdminCommercialGrantInsert,
  AdminCommercialGrantEmployerOption,
  EmployerVisibleCommercialGrant,
  ResolvedCommercialDiscount,
} from "./types";
import type { Json } from "@/lib/supabase/types";

function isExpired(grant: AdminCommercialGrantRow, now = new Date()) {
  return Boolean(
    grant.expires_at && new Date(grant.expires_at).getTime() <= now.getTime()
  );
}

type CommercialGrantQueryResult<T> = Promise<{
  data: T | null;
  error: { message: string } | null;
}>;

type AdminCommercialGrantsTable = {
  insert(values: AdminCommercialGrantInsert[]): {
    select(columns?: string): {
      single(): CommercialGrantQueryResult<AdminCommercialGrantRow>;
    };
  };
  update(values: Partial<AdminCommercialGrantRow>): {
    eq(column: string, value: string): {
      select(columns?: string): {
        single(): CommercialGrantQueryResult<AdminCommercialGrantRow>;
        maybeSingle(): CommercialGrantQueryResult<AdminCommercialGrantRow>;
      };
    };
  };
  select(columns?: string): {
    eq(column: string, value: string): {
      single(): CommercialGrantQueryResult<AdminCommercialGrantRow>;
      eq(column: string, value: string): CommercialGrantQueryResult<AdminCommercialGrantRow[]>;
      order(
        column: string,
        options: { ascending: boolean }
      ): CommercialGrantQueryResult<AdminCommercialGrantRow[]>;
      lt(
        column: string,
        value: string
      ): CommercialGrantQueryResult<AdminCommercialGrantRow[]>;
    };
    order(
      column: string,
      options: { ascending: boolean }
    ): {
      eq(column: string, value: string): {
        eq(column: string, value: string): CommercialGrantQueryResult<AdminCommercialGrantRow[]>;
        lt(
          column: string,
          value: string
        ): CommercialGrantQueryResult<AdminCommercialGrantRow[]>;
        single(): CommercialGrantQueryResult<AdminCommercialGrantRow>;
      };
    };
  };
};

type CommercialGrantFilterQuery = {
  eq(column: string, value: string): CommercialGrantFilterQuery;
};

function getCommercialGrantsTable(
  client = createAdminGrantsServiceClient()
): AdminCommercialGrantsTable {
  return client.from("admin_commercial_grants") as unknown as AdminCommercialGrantsTable;
}

export async function listCommercialGrantEmployers(
  limit = 50
): Promise<AdminCommercialGrantEmployerOption[]> {
  await assertAdminUser();
  const client = createAdminGrantsServiceClient();
  const { data, error } = await client
    .from("employers")
    .select("id, name, slug")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AdminCommercialGrantEmployerOption[];
}

export async function buildAdminCommercialGrantInsertRow(
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

export async function calculateGrantCreditConsumption(grant: AdminCommercialGrantRow) {
  const creditsTotal = grant.credits_total ?? 0;
  const nextCreditsUsed = grant.credits_used + 1;

  if (creditsTotal <= 0 || nextCreditsUsed > creditsTotal) {
    throw new Error("Grant credits have been exhausted");
  }

  return {
    nextCreditsUsed,
    nextStatus: nextCreditsUsed >= creditsTotal ? ("consumed" as const) : ("active" as const),
  };
}

function toEmployerVisibleGrant(
  grant: AdminCommercialGrantRow
): EmployerVisibleCommercialGrant {
  const visible = {
    ...grant,
  } as EmployerVisibleCommercialGrant;

  delete (visible as Partial<AdminCommercialGrantRow>).internal_notes;
  delete (visible as Partial<AdminCommercialGrantRow>).granted_by;
  delete (visible as Partial<AdminCommercialGrantRow>).revoked_by;

  return visible;
}

async function getGrantOrThrow(
  grantId: string,
  client = createAdminGrantsServiceClient()
) {
  const grantsTable = getCommercialGrantsTable(client);
  const { data, error } = await grantsTable
    .select("*")
    .eq("id", grantId)
    .single();

  if (error || !data) {
    throw new AuthorizationError("Commercial grant not found");
  }

  return data;
}

async function assertGrantAccess(
  grant: AdminCommercialGrantRow,
  client = createAdminGrantsServiceClient()
) {
  const user = await getCurrentUserOrThrow();

  if (isEligibleAdminUser(user)) {
    if (!(await hasValidAdminSession())) {
      throw new AuthorizationError("Admin session required");
    }

    return user;
  }

  await assertEmployerOwnsGrant(user.id, grant.employer_id, client);
  return user;
}

export async function createAdminCommercialGrant(input: unknown) {
  const payload = createAdminCommercialGrantSchema.parse(input);
  const user = await assertAdminUser();
  const client = createAdminGrantsServiceClient();
  const grantsTable = getCommercialGrantsTable(client);

  const { data, error } = await grantsTable
    .insert([await buildAdminCommercialGrantInsertRow(payload, user.id)])
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create commercial grant");
  }

  await logCommercialGrantAction(client, {
    grantId: data.id,
    employerId: data.employer_id,
    actorId: user.id,
    action: "grant_created",
    metadata: {
      grantType: data.grant_type,
      expiresAt: data.expires_at,
      reason: data.reason,
    },
  });

  revalidatePath("/admin/commercial-grants");
  return data;
}

export async function updateAdminCommercialGrant(grantId: string, input: unknown) {
  const payload = updateAdminCommercialGrantSchema.parse({ grantId, ...(input as object) });
  const user = await assertAdminUser();
  const client = createAdminGrantsServiceClient();
  const grantsTable = getCommercialGrantsTable(client);
  const existing = await getGrantOrThrow(grantId, client);

  const { data, error } = await grantsTable
    .update({
      employer_id: payload.employerId ?? existing.employer_id,
      grant_type: payload.grantType ?? existing.grant_type,
      product_id: payload.productId ?? existing.product_id,
      entitlement_key: payload.entitlementKey ?? existing.entitlement_key,
      plan_key: payload.planKey ?? existing.plan_key,
      credits_total: payload.creditsTotal ?? existing.credits_total,
      discount_percent:
        payload.discountPercent === undefined ? existing.discount_percent : payload.discountPercent,
      discount_amount_cents:
        payload.discountAmountCents === undefined
          ? existing.discount_amount_cents
          : payload.discountAmountCents,
      currency: payload.currency ?? existing.currency,
      starts_at: payload.startsAt ? payload.startsAt.toISOString() : existing.starts_at,
      expires_at:
        payload.expiresAt === undefined
          ? existing.expires_at
          : payload.expiresAt?.toISOString() ?? null,
      status: payload.status ?? existing.status,
      reason: payload.reason ?? existing.reason,
      internal_notes:
        payload.internalNotes === undefined ? existing.internal_notes : payload.internalNotes,
      metadata: (payload.metadata ?? existing.metadata) as Json,
    })
    .eq("id", grantId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update commercial grant");
  }

  await logCommercialGrantAction(client, {
    grantId: data.id,
    employerId: data.employer_id,
    actorId: user.id,
    action: "grant_updated",
    metadata: {
      grantType: data.grant_type,
      status: data.status,
    },
  });

  revalidatePath("/admin/commercial-grants");
  return data;
}

export async function revokeAdminCommercialGrant(grantId: string, reason: string) {
  const payload = revokeAdminCommercialGrantSchema.parse({ grantId, reason });
  const user = await assertAdminUser();
  const client = createAdminGrantsServiceClient();
  const grantsTable = getCommercialGrantsTable(client);
  const existing = await getGrantOrThrow(grantId, client);

  const { data, error } = await grantsTable
    .update({
      status: "revoked",
      revoked_at: new Date().toISOString(),
      revoked_by: user.id,
      revoke_reason: payload.reason,
    })
    .eq("id", grantId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to revoke commercial grant");
  }

  await logCommercialGrantAction(client, {
    grantId: data.id,
    employerId: data.employer_id,
    actorId: user.id,
    action: "grant_revoked",
    metadata: {
      previousStatus: existing.status,
      reason: payload.reason,
    },
  });

  revalidatePath("/admin/commercial-grants");
  return data;
}

export async function listEmployerCommercialGrants(employerId: string) {
  const client = createAdminGrantsServiceClient();
  const grantsTable = getCommercialGrantsTable(client);
  const user = await getCurrentUserOrThrow();

  if (!isEligibleAdminUser(user)) {
    await assertEmployerOwnsGrant(user.id, employerId);
  } else if (!(await hasValidAdminSession())) {
    throw new AuthorizationError("Admin session required");
  }

  const { data, error } = await grantsTable
    .select("*")
    .eq("employer_id", employerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(toEmployerVisibleGrant);
}

export async function listAllCommercialGrants(filters: {
  employerId?: string;
  status?: (typeof GRANT_STATUSES)[number];
  grantType?: string;
} = {}) {
  await assertAdminUser();
  const client = createAdminGrantsServiceClient();
  const grantsTable = getCommercialGrantsTable(client);
  let query = grantsTable.select("*").order("created_at", { ascending: false }) as unknown as CommercialGrantFilterQuery;

  if (filters.employerId) {
    query = query.eq("employer_id", filters.employerId);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.grantType) {
    query = query.eq("grant_type", filters.grantType);
  }

  const { data, error } = await (query as unknown as CommercialGrantQueryResult<AdminCommercialGrantRow[]>);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getCommercialGrant(grantId: string) {
  await assertAdminUser();
  const client = createAdminGrantsServiceClient();
  const grant = await getGrantOrThrow(grantId, client);
  return grant;
}

export async function resolveEmployerCommercialEntitlements(employerId: string) {
  const payload = resolveEmployerEntitlementsSchema.parse({ employerId });
  const client = createAdminGrantsServiceClient();
  const grantsTable = getCommercialGrantsTable(client);
  const user = await getCurrentUserOrThrow();

  if (!isEligibleAdminUser(user)) {
    await assertEmployerOwnsGrant(user.id, payload.employerId);
  } else if (!(await hasValidAdminSession())) {
    throw new AuthorizationError("Admin session required");
  }

  const { data, error } = await grantsTable
    .select("*")
    .eq("employer_id", payload.employerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return resolveEmployerCommercialEntitlementsFromGrants(
    payload.employerId,
    data ?? []
  );
}

export async function consumeGrantCredit(input: unknown) {
  const payload = consumeGrantCreditSchema.parse(input);
  const client = createAdminGrantsServiceClient();
  const grantsTable = getCommercialGrantsTable(client);
  const grant = await getGrantOrThrow(payload.grantId, client);
  const user = await assertGrantAccess(grant, client);

  if (!CREDIT_GRANT_TYPES.includes(grant.grant_type as (typeof CREDIT_GRANT_TYPES)[number])) {
    throw new Error("Grant is not a credit grant");
  }

  if (grant.status !== "active" || isExpired(grant)) {
    throw new Error("Grant is no longer active");
  }

  const { nextCreditsUsed, nextStatus } = await calculateGrantCreditConsumption(grant);

  const { data, error } = await grantsTable
    .update({
      credits_used: nextCreditsUsed,
      status: nextStatus,
    })
    .eq("id", grant.id)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to consume commercial grant credit");
  }

  await logCommercialGrantAction(client, {
    grantId: data.id,
    employerId: data.employer_id,
    actorId: user.id,
    action: "credit_used",
    metadata: {
      grantType: data.grant_type,
      creditsUsed: data.credits_used,
      creditsTotal: data.credits_total,
      context: payload.context,
    },
  });

  if (nextStatus === "consumed") {
    await logCommercialGrantAction(client, {
      grantId: data.id,
      employerId: data.employer_id,
      actorId: user.id,
      action: "grant_consumed",
      metadata: {
        grantType: data.grant_type,
        creditsUsed: data.credits_used,
      },
    });
  }

  return data;
}

export async function applyDiscountGrant(
  grantId: string,
  checkoutContext: {
    employerId: string;
    subtotalCents: number;
    currency?: string;
    checkoutLabel?: string;
  }
) {
  const client = createAdminGrantsServiceClient();
  const grant = await getGrantOrThrow(grantId, client);
  const user = await getCurrentUserOrThrow();

  if (!isEligibleAdminUser(user)) {
    await assertEmployerOwnsGrant(user.id, checkoutContext.employerId);
    if (grant.employer_id !== checkoutContext.employerId) {
      throw new AuthorizationError("You can only use your own commercial grants");
    }
  } else if (!(await hasValidAdminSession())) {
    throw new AuthorizationError("Admin session required");
  }

  if (!DISCOUNT_GRANT_TYPES.includes(grant.grant_type as (typeof DISCOUNT_GRANT_TYPES)[number])) {
    throw new Error("Grant is not a discount grant");
  }

  if (grant.status !== "active" || isExpired(grant)) {
    throw new Error("Discount grant is not active");
  }

  const discount = selectBestCommercialDiscount(
    [
      {
        grantId: grant.id,
        grantType: grant.grant_type as "percent_discount" | "fixed_discount",
        discountPercent: grant.discount_percent,
        discountAmountCents: grant.discount_amount_cents,
        currency: grant.currency ?? checkoutContext.currency ?? "eur",
        reason: grant.reason,
        expiresAt: grant.expires_at,
      } as ResolvedCommercialDiscount,
    ],
    checkoutContext.subtotalCents
  );

  await logCommercialGrantAction(client, {
    grantId: grant.id,
    employerId: grant.employer_id,
    actorId: user.id,
    action: "discount_applied",
    metadata: {
      grantType: grant.grant_type,
      subtotalCents: checkoutContext.subtotalCents,
      discountCents: discount.discountCents,
      discountedTotalCents: discount.discountedTotalCents,
      checkoutLabel: checkoutContext.checkoutLabel ?? null,
    },
  });

  return {
    grantId: grant.id,
    employerId: grant.employer_id,
    subtotalCents: checkoutContext.subtotalCents,
    discountCents: discount.discountCents,
    discountedTotalCents: discount.discountedTotalCents,
    discountGrant: discount.discount,
  };
}

export async function expireOldCommercialGrants() {
  await assertAdminUser();
  const client = createAdminGrantsServiceClient();
  const grantsTable = getCommercialGrantsTable(client);
  const nowIso = new Date().toISOString();

  const { data: grants, error } = await grantsTable
    .select("*")
    .eq("status", "active")
    .lt("expires_at", nowIso);

  if (error) {
    throw new Error(error.message);
  }

  const expiring = grants ?? [];
  const expiredIds: string[] = [];

  for (const grant of expiring) {
    const { data, error: updateError } = await grantsTable
      .update({ status: "expired" })
      .eq("id", grant.id)
      .select("*")
      .maybeSingle();

    if (updateError) {
      throw new Error(updateError.message);
    }

    if (data) {
      expiredIds.push(data.id);
      await logCommercialGrantAction(client, {
        grantId: data.id,
        employerId: data.employer_id,
        actorId: null,
        action: "grant_expired",
        metadata: {
          grantType: data.grant_type,
          expiresAt: data.expires_at,
        },
      });
    }
  }

  return {
    expiredCount: expiredIds.length,
    expiredGrantIds: expiredIds,
  };
}
