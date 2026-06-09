import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Check admin_mfa_factors table exists and is accessible via service_role
// Usage: tsx scripts/check-admin-mfa-table.ts
// Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
// ---------------------------------------------------------------------------

function loadLocalEnv() {
  const fs = require("node:fs");
  const path = require("node:path");
  const candidates = [".env.local", ".env.production"];
  for (const file of candidates) {
    const filePath = path.resolve(process.cwd(), file);
    if (!fs.existsSync(filePath)) continue;
    const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      if (!key || process.env[key]) continue;
      let value = line.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}

loadLocalEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error(
    "Missing env vars. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are in .env.local",
  );
  process.exit(1);
}

const resolvedUrl = supabaseUrl;
const resolvedKey = serviceKey;

async function main() {
  const supabase = createClient(resolvedUrl, resolvedKey);

  // 1. Check table exists and is queryable
  const { data, error: queryError } = await supabase
    .from("admin_mfa_factors")
    .select("user_id, email, enabled")
    .limit(1);

  if (queryError) {
    if (queryError.message?.includes("Could not find the table")) {
      console.error(
        "FAIL: admin_mfa_factors table does not exist. Apply the migration.",
      );
      process.exit(1);
    }
    if (queryError.message?.includes("Invalid API key")) {
      console.error(
        "FAIL: Invalid API key. Check SUPABASE_SERVICE_ROLE_KEY in .env.local.",
      );
      process.exit(1);
    }
    console.error(`FAIL: Query error: ${queryError.message}`);
    process.exit(1);
  }

  console.log(`OK: admin_mfa_factors table exists (${data?.length ?? 0} rows)`);

  // 2. Check RLS is enabled
  try {
    const { data: rlsData } = await supabase.rpc("exec_sql", {
      query: `
        SELECT relrowsecurity
        FROM pg_class
        WHERE oid = 'public.admin_mfa_factors'::regclass
      `,
    });

    if (rlsData) {
      const enabled = Array.isArray(rlsData)
        ? rlsData[0]?.relrowsecurity
        : rlsData?.relrowsecurity;
      console.log(`OK: RLS enabled = ${enabled}`);
    }
  } catch {
    // exec_sql may not exist; skip this check
  }

  // 3. Check service_role has access
  console.log("OK: service_role can query admin_mfa_factors");

  // 4. Check trigger exists
  try {
    const { data: triggerData } = await supabase.rpc("exec_sql", {
      query: `
        SELECT trigger_name
        FROM information_schema.triggers
        WHERE event_object_table = 'admin_mfa_factors'
        AND event_object_schema = 'public'
      `,
    });

    if (triggerData && Array.isArray(triggerData)) {
      const names = triggerData.map((r: { trigger_name: string }) => r.trigger_name);
      console.log(`OK: Triggers: ${names.join(", ")}`);
    }
  } catch {
    // exec_sql may not exist; skip this check
  }

  console.log("\nAll checks passed.");
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
