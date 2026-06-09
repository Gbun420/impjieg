/**
 * Predeploy Legal Gate
 *
 * Run: npm run predeploy:legal
 *
 * Checks before deployment:
 * 1. Legal tables exist
 * 2. Seed documents present
 * 3. Env vars configured
 * 4. No migration drift (documents match constants)
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { LEGAL_DOCUMENTS, LEGAL_RECEIPTS_ENABLED } from "@/lib/legal/constants";

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient<Database>(url, key);
}

async function main() {
  console.log("=== Predeploy Legal Gate ===\n");

  if (!LEGAL_RECEIPTS_ENABLED) {
    console.log("⚠  LEGAL_RECEIPTS_ENABLED is false — legal receipts are disabled");
    console.log("   This is OK for deployment but legal acceptance won't be recorded.");
    return;
  }

  let errors = 0;
  const supabase = getServiceClient();

  // 1. Tables
  const { error: tableErr } = await supabase.from("legal_acceptance_events").select("id").limit(1);
  if (tableErr) {
    console.log(`❌ legal_acceptance_events not accessible: ${tableErr.message}`);
    errors++;
  } else {
    console.log("✅ legal_acceptance_events: OK");
  }

  // 2. Env vars
  const missingEnvs = [];
  if (!process.env.LEGAL_ARCHIVE_EMAIL) missingEnvs.push("LEGAL_ARCHIVE_EMAIL");
  if (!process.env.DATA_PROTECTION_EMAIL) missingEnvs.push("DATA_PROTECTION_EMAIL");
  if (!process.env.SUPPORT_EMAIL) missingEnvs.push("SUPPORT_EMAIL");

  if (missingEnvs.length > 0) {
    console.log(`❌ Missing env vars: ${missingEnvs.join(", ")}`);
    errors++;
  } else {
    console.log("✅ Legal env vars: OK");
  }

  // 3. Document drift check
  const { data: dbDocs } = await supabase.from("legal_documents").select("slug, is_active");
  if (dbDocs) {
    const dbSlugs = new Set(dbDocs.filter(d => d.is_active).map(d => d.slug));
    const codeSlugs = new Set(LEGAL_DOCUMENTS.map(d => d.slug));
    const missingFromDb = [...codeSlugs].filter(s => !dbSlugs.has(s));
    const extraInDb = [...dbSlugs].filter(s => !codeSlugs.has(s));

    if (missingFromDb.length > 0) {
      console.log(`❌ Documents missing from DB: ${missingFromDb.join(", ")}`);
      console.log("   Run: npm run legal:seed-docs");
      errors++;
    }
    if (extraInDb.length > 0) {
      console.log(`⚠  Extra documents in DB not in code: ${extraInDb.join(", ")}`);
    }
    if (missingFromDb.length === 0) {
      console.log("✅ Document drift: OK");
    }
  }

  console.log(`\n=== Predeploy Gate: ${errors === 0 ? "PASS ✅" : "FAIL ❌"} ===`);
  if (errors > 0) process.exit(1);
}

main().catch((err) => {
  console.error("Predeploy check failed:", err.message);
  process.exit(1);
});
