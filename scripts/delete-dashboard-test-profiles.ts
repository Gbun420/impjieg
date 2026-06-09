import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// ---------------------------------------------------------------------------
// Constants — must match seed script
// ---------------------------------------------------------------------------

const QA_EMAILS = [
  "qa.candidate+dashboard@impjieg.test",
  "qa.employer+dashboard@impjieg.test",
  "qa.admin+dashboard@impjieg.test",
];

const QA_CANDIDATE_EMAIL = "qa.candidate+dashboard@impjieg.test";
const QA_EMPLOYER_SLUG = "qa-signal-labs";
const QA_JOB_SLUGS = [
  "qa-frontend-engineer",
  "qa-compliance-analyst",
  "qa-product-designer-draft",
  "qa-closed-operations-role",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const contents = fs.readFileSync(filePath, "utf8");
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const equalsIndex = line.indexOf("=");
    if (equalsIndex === -1) continue;
    const key = line.slice(0, equalsIndex).trim();
    if (!key || process.env[key]) continue;
    let value = line.slice(equalsIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function loadLocalEnv() {
  loadEnvFile(path.resolve(process.cwd(), ".env.local"));
  loadEnvFile(path.resolve(process.cwd(), ".env.production"));
  loadEnvFile(path.resolve(process.cwd(), ".env"));
}

async function findQaUsers(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
): Promise<Map<string, string>> {
  const emailToId = new Map<string, string>();

  // Use SQL via RPC to query auth.users directly (admin API may not work)
  const { data, error } = await supabase.rpc("exec_sql", {
    query: `SELECT id, email FROM auth.users WHERE email IN (${QA_EMAILS.map((e) => `'${e}'`).join(", ")})`,
  });

  if (error) {
    // Fallback: try to query via a simple RPC or return empty
    console.warn(`  Warning: Could not query auth.users via RPC: ${error.message}`);
    return emailToId;
  }

  const rows = data as { id: string; email: string }[] | null;
  for (const user of rows ?? []) {
    if (user.email && QA_EMAILS.includes(user.email.toLowerCase())) {
      emailToId.set(user.email.toLowerCase(), user.id);
    }
  }

  return emailToId;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  loadLocalEnv();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in env"
    );
  }

  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabaseAny = supabase as any;

  console.log("Deleting QA dashboard test profiles...\n");

  // --- 1. Find QA auth users ---
  console.log("1. Finding QA auth users...");
  const qaUserIds = await findQaUsers(supabaseAny);
  const candidateUserId = qaUserIds.get(QA_CANDIDATE_EMAIL) ?? null;
  const allQaUserIds = Array.from(qaUserIds.values());

  console.log(`  Found ${qaUserIds.size} QA users`);
  for (const [email, id] of qaUserIds) {
    console.log(`    ${email} → ${id}`);
  }

  // --- 2. Find QA employer profile ---
  console.log("\n2. Finding QA employer profile...");
  const { data: employerProfile } = await supabase
    .from("employers")
    .select("id")
    .eq("slug", QA_EMPLOYER_SLUG)
    .maybeSingle<{ id: string }>();

  const employerId = employerProfile?.id ?? null;
  console.log(`  Employer profile: ${employerId ?? "not found"}`);

  // --- 3. Find QA jobs ---
  console.log("\n3. Finding QA jobs...");
  const jobIds: string[] = [];
  for (const slug of QA_JOB_SLUGS) {
    const { data: job } = await supabase
      .from("jobs")
      .select("id")
      .eq("slug", slug)
      .maybeSingle<{ id: string }>();
    if (job?.id) {
      jobIds.push(job.id);
      console.log(`  Found job: ${slug} → ${job.id}`);
    }
  }

  // --- 4. Delete dependent records (order matters for FK) ---
  console.log("\n4. Deleting dependent records...");

  // candidate_applications (by user_id)
  if (allQaUserIds.length > 0) {
    const { count } = await supabase
      .from("candidate_applications")
      .delete()
      .in("user_id", allQaUserIds);
    console.log(`  Deleted ${count ?? 0} candidate_applications`);
  }

  // saved_jobs (by user_id)
  if (candidateUserId) {
    const { count } = await supabase
      .from("saved_jobs")
      .delete()
      .eq("user_id", candidateUserId);
    console.log(`  Deleted ${count ?? 0} saved_jobs`);
  }

  // candidate_alerts (by user_id)
  if (candidateUserId) {
    const { count } = await supabase
      .from("candidate_alerts")
      .delete()
      .eq("user_id", candidateUserId);
    console.log(`  Deleted ${count ?? 0} candidate_alerts`);
  }

  // job_alerts (by email prefix)
  const { count: alertCount } = await supabase
    .from("job_alerts")
    .delete()
    .eq("email", QA_CANDIDATE_EMAIL);
  console.log(`  Deleted ${alertCount ?? 0} job_alerts`);

  // applications (by employer_id or candidate_email)
  if (employerId) {
    const { count } = await supabase
      .from("applications")
      .delete()
      .eq("employer_id", employerId);
    console.log(`  Deleted ${count ?? 0} applications (by employer_id)`);
  }
  // Also delete by candidate_email prefix
  const { count: appByEmailCount } = await supabase
    .from("applications")
    .delete()
    .like("candidate_email", "qa.applicant.%@impjieg.test");
  console.log(`  Deleted ${appByEmailCount ?? 0} applications (by candidate_email)`);

  // jobs (by employer_id)
  if (employerId) {
    const { count } = await supabase
      .from("jobs")
      .delete()
      .eq("employer_id", employerId);
    console.log(`  Deleted ${count ?? 0} jobs`);
  }

  // candidate_profiles (by user_id)
  if (candidateUserId) {
    const { count } = await supabase
      .from("candidate_profiles")
      .delete()
      .eq("user_id", candidateUserId);
    console.log(`  Deleted ${count ?? 0} candidate_profiles`);
  }

  // admin_mfa_factors (by user_id)
  for (const userId of allQaUserIds) {
    await supabase
      .from("admin_mfa_factors")
      .delete()
      .eq("user_id", userId);
  }
  console.log(`  Deleted admin_mfa_factors for ${allQaUserIds.length} users`);

  // employers (by slug prefix)
  const { count: empCount } = await supabase
    .from("employers")
    .delete()
    .eq("slug", QA_EMPLOYER_SLUG);
  console.log(`  Deleted ${empCount ?? 0} employers`);

  // --- 5. Delete auth users ---
  console.log("\n5. Deleting auth users...");
  for (const [email, userId] of qaUserIds) {
    // Use SQL to delete auth user (admin API may not work)
    const { error } = await supabase.rpc("exec_sql", {
      query: `DELETE FROM auth.users WHERE id = '${userId}'`,
    });
    if (error) {
      console.error(`  Failed to delete ${email}: ${error.message}`);
    } else {
      console.log(`  Deleted auth user: ${email}`);
    }
  }

  // --- 6. Remove credentials file ---
  console.log("\n6. Removing credentials file...");
  const credentialsPath = path.resolve(process.cwd(), "output/qa-dashboard-credentials.local.md");
  if (fs.existsSync(credentialsPath)) {
    fs.unlinkSync(credentialsPath);
    console.log(`  Removed: ${credentialsPath}`);
  } else {
    console.log("  No credentials file found");
  }

  console.log("\n--- Delete Summary ---");
  console.log("QA dashboard test profiles deleted.");
  console.log("Non-QA data was not touched.");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`\nDelete failed: ${message}`);
  process.exitCode = 1;
});
