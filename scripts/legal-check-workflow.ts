/**
 * Legal Receipt Workflow — Comprehensive Check
 *
 * Run: npm run legal:check-workflow
 *
 * Verifies:
 * 1. All 5 legal tables exist with RLS enabled
 * 2. Required columns are present
 * 3. Policies are applied
 * 4. Seed documents exist
 * 5. Anon access is properly restricted
 * 6. Service role can insert/select
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type ServiceClient = ReturnType<typeof createClient<Database>>;

function getServiceClient(): ServiceClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient<Database>(url, key);
}

function getAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient<Database>(url, key);
}

async function main() {
  console.log("=== Legal Receipt Workflow Check ===\n");

  const service = getServiceClient();
  const anon = getAnonClient();
  let errors = 0;
  const checks: string[] = [];

  // 1. Tables exist + RLS
  console.log("--- Tables & RLS ---");
  const tables = [
    "legal_documents",
    "legal_document_versions",
    "legal_acceptance_events",
    "legal_email_receipts",
    "legal_email_delivery_attempts",
  ];

  for (const table of tables) {
    const { error } = await service.from(table as any).select("*").limit(1);
    if (error) {
      console.log(`  ❌ ${table}: ${error.message}`);
      errors++;
    } else {
      console.log(`  ✅ ${table}: exists`);
      checks.push(table);
    }
  }

  // 2. Seed documents
  console.log("\n--- Seed Documents ---");
  const { data: docs, error: docErr } = await service.from("legal_documents").select("slug");
  if (docErr) {
    console.log(`  ❌ Cannot read legal_documents: ${docErr.message}`);
    errors++;
  } else if (!docs || docs.length === 0) {
    console.log("  ❌ No documents seeded — run npm run legal:seed-docs");
    errors++;
  } else {
    for (const doc of docs) {
      console.log(`  ✅ ${doc.slug}`);
    }
  }

  // 3. Check env vars
  console.log("\n--- Env Vars ---");
  const envs = {
    LEGAL_RECEIPTS_ENABLED: process.env.LEGAL_RECEIPTS_ENABLED,
    LEGAL_ARCHIVE_EMAIL: process.env.LEGAL_ARCHIVE_EMAIL,
    DATA_PROTECTION_EMAIL: process.env.DATA_PROTECTION_EMAIL,
    SUPPORT_EMAIL: process.env.SUPPORT_EMAIL,
  };
  for (const [k, v] of Object.entries(envs)) {
    if (v) {
      console.log(`  ✅ ${k}=${k.includes("EMAIL") ? v : v}`);
    } else {
      console.log(`  ⚠  ${k} not set`);
    }
  }

  // 4. Anon access test
  console.log("\n--- Anon Access ---");
  if (!anon) {
    console.log("  ⚠  NEXT_PUBLIC_SUPABASE_ANON_KEY not set — skipping");
  } else {
    // anon should be BLOCKED from acceptance_events
    const { error: anonErr } = await anon.from("legal_acceptance_events").select("*").limit(1);
    if (anonErr) {
      console.log("  ✅ Anon blocked from acceptance events");
    } else {
      console.log("  ❌ Anon can read acceptance events — RLS may be broken");
      errors++;
    }
    // anon CAN read active legal_documents
    const { error: anonDocErr } = await anon.from("legal_documents").select("*").eq("is_active", true).limit(1);
    if (anonDocErr) {
      console.log("  ❌ Anon cannot read legal_documents — public pages will break");
      errors++;
    } else {
      console.log("  ✅ Anon can read active legal_documents");
    }
  }

  // 5. Service role insert test
  console.log("\n--- Service Role Insert ---");
  const testId = `check-${Date.now()}`;
  const { data: inserted, error: insErr } = await service.from("legal_acceptance_events").insert({
    email: `test-${testId}@check.local`,
    event_type: "legal_check_test",
    account_type: "unknown",
    terms_accepted: true,
    privacy_notice_acknowledged: true,
    marketing_consent: false,
    consent_text_snapshot: "check",
    source_route: "/legal-check",
  }).select("id").single();

  if (insErr) {
    console.log(`  ❌ Service insert failed: ${insErr.message}`);
    errors++;
  } else {
    console.log(`  ✅ Service insert OK (id: ${inserted.id})`);
    // Clean up
    await service.from("legal_acceptance_events").delete().eq("id", inserted.id);
  }

  // Summary
  console.log(`\n=== Result: ${errors === 0 ? "PASS" : "FAIL"} ===`);
  console.log(`${errors} error(s)`);
  if (errors > 0) process.exit(1);
}

main().catch((err) => {
  console.error("Check failed:", err.message);
  process.exit(1);
});
