type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type AdminAuditEntryInput = {
  adminEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  beforeValue?: unknown;
  afterValue?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export type AdminAuditRecord = {
  admin_email: string;
  action: string;
  entity_type: string;
  entity_id: string;
  before_value: JsonValue | null;
  after_value: JsonValue | null;
  ip_address: string | null;
  user_agent: string | null;
};

type AdminAuditTable = {
  insert(values: AdminAuditRecord[]): PromiseLike<{ error: { message: string } | null }>;
};

type AdminAuditClient = {
  from(table: "admin_audit_logs"): AdminAuditTable;
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
        if (/password|secret|token|api[_-]?key|authorization/i.test(key)) {
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

export function buildAdminAuditRecord(input: AdminAuditEntryInput): AdminAuditRecord {
  return {
    admin_email: input.adminEmail.trim().toLowerCase(),
    action: input.action.trim(),
    entity_type: input.entityType.trim(),
    entity_id: input.entityId.trim(),
    before_value: sanitizeValue(input.beforeValue),
    after_value: sanitizeValue(input.afterValue),
    ip_address: input.ipAddress?.trim() || null,
    user_agent: input.userAgent?.trim() || null,
  };
}

export async function logAdminAction(
  client: AdminAuditClient,
  input: AdminAuditEntryInput
) {
  try {
    const { error } = await client.from("admin_audit_logs").insert([
      buildAdminAuditRecord(input),
    ]);

    if (error) {
      console.error("Admin audit log failed:", error.message);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown audit error";
    console.error("Admin audit log threw:", message);
  }
}
