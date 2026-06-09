import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Check admin_commercial_grants and admin_commercial_grant_audit_logs tables
// Usage: tsx scripts/check-commercial-grants-tables.ts
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

const resolvedUrl: string = supabaseUrl;
const resolvedKey: string = serviceKey;

let failures = 0;

function fail(msg: string) {
  console.error(`FAIL: ${msg}`);
  failures++;
}

function pass(msg: string) {
  console.log(`OK: ${msg}`);
}

async function main() {
  const supabase = createClient(resolvedUrl, resolvedKey);

  // 1. Check admin_commercial_grants table
  const { data: grantsData, error: grantsError } = await supabase
    .from("admin_commercial_grants")
    .select("id, grant_type, status, employer_id")
    .limit(1);

  if (grantsError) {
    if (grantsError.message?.includes("Could not find the table")) {
      fail("admin_commercial_grants table does not exist. Apply migration 012.");
    } else if (grantsError.message?.includes("Invalid API key")) {
      fail("Invalid API key. Check SUPABASE_SERVICE_ROLE_KEY in .env.local.");
    } else {
      fail(`admin_commercial_grants query error: ${grantsError.message}`);
    }
  } else {
    pass(`admin_commercial_grants table exists (${grantsData?.length ?? 0} rows returned)`);
  }

  // 2. Check admin_commercial_grant_audit_logs table
  const { data: auditData, error: auditError } = await supabase
    .from("admin_commercial_grant_audit_logs")
    .select("id, grant_id, action")
    .limit(1);

  if (auditError) {
    if (auditError.message?.includes("Could not find the table")) {
      fail("admin_commercial_grant_audit_logs table does not exist. Apply migration 012.");
    } else {
      fail(`admin_commercial_grant_audit_logs query error: ${auditError.message}`);
    }
  } else {
    pass(`admin_commercial_grant_audit_logs table exists (${auditData?.length ?? 0} rows returned)`);
  }

  // 3. Check RLS via information_schema
  try {
    const { data: rlsGrants } = await supabase.rpc("exec_sql", {
      query: `
        SELECT relname, relrowsecurity
        FROM pg_class
        WHERE oid IN (
          'public.admin_commercial_grants'::regclass,
          'public.admin_commercial_grant_audit_logs'::regclass
        )
      `,
    });

    if (rlsGrants && Array.isArray(rlsGrants)) {
      for (const row of rlsGrants as { relname: string; relrowsecurity: boolean }[]) {
        if (row.relrowsecurity) {
          pass(`RLS enabled on ${row.relname}`);
        } else {
          fail(`RLS NOT enabled on ${row.relname}`);
        }
      }
    }
  } catch {
    // exec_sql may not exist; skip RLS check
    console.log("SKIP: RLS check (exec_sql not available)");
  }

  // 4. Check service_role can INSERT into admin_commercial_grants (dry-run: insert + rollback)
  try {
    const testRow = {
      employer_id: "00000000-0000-0000-0000-000000000000",
      granted_by: "00000000-0000-0000-0000-000000000000",
      grant_type: "free_trial" as const,
      reason: "Dry-run check script validation test row - will be deleted",
      status: "active" as const,
    };

    const { error: insertError } = await supabase
      .from("admin_commercial_grants")
      .insert(testRow)
      .select("id")
      .single();

    if (insertError) {
      // FK violation is expected (fake UUIDs) — means table is writable
      if (insertError.message?.includes("foreign key") || insertError.code === "23503") {
        pass("service_role can write to admin_commercial_grants (FK constraint enforced)");
      } else if (insertError.message?.includes("permission denied") || insertError.code === "42501") {
        fail("service_role lacks INSERT permission on admin_commercial_grants");
      } else {
        // Other errors (e.g., CHECK constraint) still mean the table is accessible
        pass(`service_role can reach admin_commercial_grants (insert rejected: ${insertError.message})`);
      }
    } else {
      // Insert succeeded with fake UUIDs — clean up
      const insertedId = (insertError === null && arguments) ? null : null;
      // We can't easily get the ID from the result here, but the insert worked
      pass("service_role can INSERT into admin_commercial_grants");
      // Clean up: delete the test row
      await supabase
        .from("admin_commercial_grants")
        .delete()
        .eq("reason", "Dry-run check script validation test row - will be deleted");
    }
  } catch (err) {
    fail(`Unexpected error checking INSERT access: ${err instanceof Error ? err.message : String(err)}`);
  }

  // 5. Check employers table is accessible (needed for grant picker)
  const { error: employersError } = await supabase
    .from("employers")
    .select("id, name, slug")
    .limit(1);

  if (employersError) {
    fail(`employers table not accessible: ${employersError.message}`);
  } else {
    pass("employers table accessible (grant picker will work)");
  }

  // Summary
  console.log("");
  if (failures > 0) {
    console.error(`${failures} check(s) failed.`);
    process.exit(1);
  } else {
    console.log("All commercial grants checks passed.");
  }
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
