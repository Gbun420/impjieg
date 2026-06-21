/**
 * Seed the verified Malta ATS sources in one run.
 *
 * Wires the employers + job_sources for the feeds that were curl-verified to
 * return real Malta jobs (Greenhouse/Lever/Teamtailor). Idempotent: re-running
 * reuses existing employers/sources. Requires service-role env.
 *
 * Run:
 *   npx tsx scripts/aggregator-seed-malta-sources.ts
 *   # auto-publish imported jobs as live (else they import as drafts for review):
 *   SEED_DEFAULT_STATUS=confirmed npx tsx scripts/aggregator-seed-malta-sources.ts
 *
 * Then trigger an import (dry run first):
 *   curl -H "Authorization: Bearer $CRON_SECRET" "$SITE/api/jobs/import?dryRun=true"
 *
 * Never logs secrets. Verify each feed independently before going live.
 */

import { createClient } from "@supabase/supabase-js";

// Verified Malta employer feeds (curl-confirmed to return Malta jobs at build time).
const SOURCES = [
  { name: "Betsson Group", website: "https://www.betssongroup.com", feedUrl: "https://boards-api.greenhouse.io/v1/boards/betsson/jobs?content=true" },
  { name: "Kaizen Gaming", website: "https://kaizengaming.com", feedUrl: "https://boards-api.greenhouse.io/v1/boards/kaizengaming/jobs?content=true" },
  { name: "Nium", website: "https://www.nium.com", feedUrl: "https://api.lever.co/v0/postings/nium?mode=json" },
  { name: "BrainRocket", website: "https://brainrocket.io", feedUrl: "https://boards-api.greenhouse.io/v1/boards/brainrocketltd/jobs?content=true" },
  { name: "Soft2Bet", website: "https://soft2bet.com", feedUrl: "https://boards-api.greenhouse.io/v1/boards/soft2bet/jobs?content=true" },
  { name: "EveryMatrix", website: "https://everymatrix.com", feedUrl: "https://everymatrix.teamtailor.com/jobs.json" },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key);
}

async function ensureAggregatorUser(supabase: ReturnType<typeof getServiceClient>, email: string): Promise<string> {
  const { data: list } = await supabase.auth.admin.listUsers();
  const existing = list?.users?.find((u) => u.email === email)?.id;
  if (existing) return existing;
  const { data: created, error } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    app_metadata: { role: "aggregator" },
  });
  if (error || !created.user) throw new Error(`Create aggregator user failed: ${error?.message}`);
  return created.user.id;
}

async function setupOne(
  supabase: ReturnType<typeof getServiceClient>,
  userId: string,
  src: { name: string; website: string; feedUrl: string },
  defaultStatus: string
): Promise<string> {
  const slug = slugify(src.name);

  // Employer (reuse by slug).
  const { data: existingEmp } = await supabase.from("employers").select("id").eq("slug", slug).maybeSingle();
  let employerId = (existingEmp as { id?: string } | null)?.id;
  if (!employerId) {
    const { data: emp, error } = await supabase
      .from("employers")
      .insert([{ user_id: userId, name: src.name, slug, website: src.website, location: "Malta", is_verified: false }])
      .select("id")
      .single();
    if (error || !emp) throw new Error(`employer "${src.name}": ${error?.message}`);
    employerId = (emp as { id: string }).id;
  }

  // Source (reuse by feed_url).
  const { data: existingSrc } = await supabase.from("job_sources").select("id").eq("feed_url", src.feedUrl).maybeSingle();
  if ((existingSrc as { id?: string } | null)?.id) {
    const id = (existingSrc as { id: string }).id;
    await supabase
      .from("job_sources")
      .update({ default_company_id: employerId, default_status: defaultStatus, enabled: true })
      .eq("id", id);
    return `updated ${src.name}`;
  }
  const { error } = await supabase.from("job_sources").insert([
    {
      name: src.name,
      type: "ats_feed",
      base_url: src.website,
      feed_url: src.feedUrl,
      enabled: true,
      default_status: defaultStatus,
      default_company_id: employerId,
      employer_assignment_mode: "source_company",
      expiry_days: 30,
    },
  ]);
  if (error) throw new Error(`source "${src.name}": ${error.message}`);
  return `created ${src.name}`;
}

async function main() {
  const defaultStatus = process.env.SEED_DEFAULT_STATUS || "needs_confirmation";
  const email = process.env.AGGREGATOR_EMAIL || "aggregator@impjieg.work";
  const supabase = getServiceClient();

  const userId = await ensureAggregatorUser(supabase, email);
  console.log(`Aggregator user ready: ${email}`);
  console.log(`default_status = ${defaultStatus}${defaultStatus === "confirmed" ? " (jobs publish live)" : " (jobs import as drafts for review)"}\n`);

  for (const src of SOURCES) {
    try {
      const msg = await setupOne(supabase, userId, src, defaultStatus);
      console.log(`  ✓ ${msg}`);
    } catch (err) {
      console.error(`  ✗ ${src.name}: ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log("\nNext: dry-run the import, then let the 6-hourly cron publish:");
  console.log('  curl -H "Authorization: Bearer $CRON_SECRET" "$SITE/api/jobs/import?dryRun=true"');
}

main().catch((err) => {
  console.error("Seed failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
