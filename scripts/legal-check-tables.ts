/**
 * Legal Receipt Workflow — Table verification script.
 *
 * Run: npx tsx scripts/legal-check-tables.ts
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *           NEXT_PUBLIC_SUPABASE_ANON_KEY (for anon checks)
 *
 * Verifies in-database state — no exec_sql calls, no auth.users access.
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type ServiceClient = ReturnType<typeof createClient<Database>>;

function getServiceClient(): ServiceClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient<Database>(url, key);
}

function getAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient<Database>(url, key);
}

const REQUIRED_TABLES = [
  "legal_documents",
  "legal_document_versions",
  "legal_acceptance_events",
  "legal_email_receipts",
  "legal_email_delivery_attempts",
] as const;

const REQUIRED_COLUMNS: Record<string, string[]> = {
  legal_documents: [
    "id", "slug", "title", "description", "audience",
    "is_active", "created_at", "updated_at",
  ],
  legal_document_versions: [
    "id", "document_id", "version", "effective_at",
    "content_hash", "public_url", "summary", "is_current", "created_at",
  ],
  legal_acceptance_events: [
    "id", "user_id", "email", "account_type", "event_type",
    "related_entity_type", "related_entity_id", "document_version_ids",
    "terms_accepted", "privacy_notice_acknowledged", "marketing_consent",
    "consent_text_snapshot", "source_route", "ip_hash",
    "user_agent_hash", "metadata", "created_at",
  ],
  legal_email_receipts: [
    "id", "acceptance_event_id", "recipient_email", "copy_type",
    "subject", "html_hash", "text_hash", "provider",
    "provider_message_id", "status", "error", "created_at", "sent_at",
  ],
  legal_email_delivery_attempts: [
    "id", "receipt_id", "provider", "status",
    "provider_message_id", "error", "attempted_at",
  ],
};

interface TableCheck {
  table: string;
  exists: boolean;
  columnsOk: boolean;
  anonBlocked: boolean | null;
  serviceWorks: boolean;
  errors: string[];
}

function isMissingTableError(msg: string): boolean {
  const lower = msg.toLowerCase();
  return (
    lower.includes("does not exist") ||
    lower.includes("relation") ||
    lower.includes("not found")
  );
}

async function checkTable(
  serviceClient: ServiceClient,
  anonClient: ReturnType<typeof createClient<Database>> | null,
  tableName: string,
): Promise<TableCheck> {
  const result: TableCheck = {
    table: tableName,
    exists: false,
    columnsOk: false,
    anonBlocked: null,
    serviceWorks: false,
    errors: [],
  };

  // 1. Check existence + columns by selecting one row with service role
  const { data: row, error: selErr } = await serviceClient
    .from(tableName as any)
    .select("*")
    .limit(1);

  if (selErr) {
    if (isMissingTableError(selErr.message)) {
      result.errors.push(`Table does not exist: ${selErr.message}`);
      return result;
    }
    // Table exists but select fails for another reason
    result.exists = true;
    result.errors.push(`SELECT failed: ${selErr.message}`);
    return result;
  }

  result.exists = true;
  result.serviceWorks = true;

  // Check required columns from row keys (or empty array if no rows)
  const rowData = (row as any[])?.[0];
  const actualColumns = rowData ? Object.keys(rowData) : [];
  const required = REQUIRED_COLUMNS[tableName] || [];
  const missingColumns = required.filter((col) => !actualColumns.includes(col));

  if (actualColumns.length === 0) {
    result.errors.push("No rows to verify columns — column check skipped");
    result.columnsOk = true; // Give benefit of doubt
  } else if (missingColumns.length > 0) {
    result.errors.push(`Missing columns: ${missingColumns.join(", ")}`);
  } else {
    result.columnsOk = true;
  }

  // 2. Anon access check
  if (anonClient) {
    const { error: anonErr } = await anonClient
      .from(tableName as any)
      .select("*")
      .limit(1);

    // legal_documents and legal_document_versions have public read policies
    const isPublicRead =
      tableName === "legal_documents" || tableName === "legal_document_versions";

    if (isPublicRead) {
      result.anonBlocked = !!anonErr; // should NOT be blocked
      if (anonErr) {
        result.errors.push(`Public read table but anon SELECT failed: ${anonErr.message}`);
      }
    } else {
      result.anonBlocked = !!anonErr; // SHOULD be blocked
      if (!anonErr) {
        result.errors.push("Anon can SELECT — should be blocked");
      }
    }
  }

  return result;
}

async function main() {
  console.log("=== Legal Receipt Workflow — Table Verification ===\n");

  const serviceClient = getServiceClient();
  const anonClient = getAnonClient();

  if (!anonClient) {
    console.log("⚠  NEXT_PUBLIC_SUPABASE_ANON_KEY not set — skipping anon access tests\n");
  }

  const results: TableCheck[] = [];
  for (const tableName of REQUIRED_TABLES) {
    process.stdout.write(`Checking "${tableName}"... `);
    const result = await checkTable(serviceClient, anonClient, tableName);
    results.push(result);

    const pass = result.exists && result.columnsOk && result.serviceWorks &&
      (result.anonBlocked === null || result.anonBlocked === true || tableName === "legal_documents" || tableName === "legal_document_versions");

    if (result.exists) {
      const status = pass ? "PASS" : "WARN";
      console.log(status);
    } else {
      console.log("MISSING");
    }

    for (const err of result.errors) {
      console.log(`  ⚠  ${err}`);
    }
  }

  // Summary
  console.log("\n=== Summary ===\n");

  let allOk = true;
  for (const r of results) {
    const ok = r.exists && r.columnsOk && r.serviceWorks && r.errors.length === 0;
    if (!ok) allOk = false;
    const icon = r.exists ? (ok ? "✅" : "⚠️") : "❌";
    const cols = r.exists ? (r.columnsOk ? "cols=ok" : "cols=missing") : "cols=n/a";
    const service = r.exists ? (r.serviceWorks ? "svc=ok" : "svc=fail") : "svc=n/a";
    const anon = r.anonBlocked === null ? "anon=skipped" : (r.anonBlocked ? "anon=blocked" : "anon=open");
    console.log(`${icon} ${r.table}: ${cols} ${service} ${anon}`);
  }

  console.log(allOk ? "\n✅ All tables verified" : "\n⚠  Some tables need attention — check errors above");

  if (!allOk) process.exit(1);
}

main().catch((err) => {
  console.error("Check-tables failed:", err.message);
  process.exit(1);
});
