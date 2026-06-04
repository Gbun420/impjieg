import type { Json } from "@/lib/supabase/types";
import type {
  AdminCommercialGrantAuditLogInsert,
  GrantAction,
} from "./types";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type GrantAuditClient = {
  from(table: "admin_commercial_grant_audit_logs"): {
    insert(values: AdminCommercialGrantAuditLogInsert[]): PromiseLike<{
      error: { message: string } | null;
    }>;
  };
};

export type CommercialGrantAuditInput = {
  grantId?: string | null;
  employerId: string;
  actorId?: string | null;
  action: GrantAction;
  metadata?: unknown;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function sanitizeValue(value: unknown): JsonValue | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    return value.length > 2000 ? `${value.slice(0, 2000)}…` : value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => {
        if (/password|secret|token|api[_-]?key|authorization|stripe|service_role/i.test(key)) {
          return [key, "[redacted]"];
        }

        return [key, sanitizeValue(item)];
      })
    ) as JsonValue;
  }

  if (value instanceof Error) {
    return { name: value.name, message: value.message } as JsonValue;
  }

  return String(value);
}

function buildCommercialGrantAuditRecord(
  input: CommercialGrantAuditInput
): AdminCommercialGrantAuditLogInsert {
  return {
    grant_id: input.grantId ?? null,
    employer_id: input.employerId,
    actor_id: input.actorId ?? null,
    action: input.action,
    metadata: (sanitizeValue(input.metadata) ?? {}) as Json,
  };
}

export async function logCommercialGrantAction(
  client: GrantAuditClient,
  input: CommercialGrantAuditInput
) {
  try {
    const { error } = await client.from("admin_commercial_grant_audit_logs").insert([
      buildCommercialGrantAuditRecord(input),
    ]);

    if (error) {
      console.error("Commercial grant audit log failed:", error.message);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown audit error";
    console.error("Commercial grant audit log threw:", message);
  }
}

export { buildCommercialGrantAuditRecord };

