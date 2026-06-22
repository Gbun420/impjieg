/**
 * Aggregator source setup — provisions the employer + job_source for one ATS feed.
 *
 * Because `employers.user_id` is NOT NULL, aggregated jobs need a real employer
 * row owned by a system "aggregator" auth user. This script creates that user
 * once (idempotent), creates/reuses an employer for the company, and creates a
 * `job_sources` row pointing at the public ATS feed.
 *
 * Run (service-role env required):
 *   SOURCE_NAME="Acme Malta" \
 *   SOURCE_FEED_URL="https://boards-api.greenhouse.io/v1/boards/acme/jobs?content=true" \
 *   SOURCE_WEBSITE="https://acme.com" \
 *   DEFAULT_STATUS="needs_confirmation" \
 *   npx tsx scripts/aggregator-setup-employer.ts
 *
 * Set DEFAULT_STATUS="confirmed" to auto-publish imported jobs as `active`.
 * Never logs secrets.
 */

import { createClient } from "@supabase/supabase-js";

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

async function main() {
  const name = process.env.SOURCE_NAME;
  const feedUrl = process.env.SOURCE_FEED_URL;
  if (!name || !feedUrl) {
    console.error("Set SOURCE_NAME and SOURCE_FEED_URL.");
    process.exit(1);
  }
  const website = process.env.SOURCE_WEBSITE || null;
  const location = process.env.SOURCE_LOCATION || "Malta";
  const defaultStatus = process.env.DEFAULT_STATUS || "needs_confirmation";
  const aggregatorEmail = process.env.AGGREGATOR_EMAIL || "aggregator@impjieg.work";

  const supabase = getServiceClient();

  // 1. System aggregator auth user (idempotent).
  const { data: list } = await supabase.auth.admin.listUsers();
  let systemUserId = list?.users?.find((u) => u.email === aggregatorEmail)?.id;
  if (!systemUserId) {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email: aggregatorEmail,
      email_confirm: true,
      app_metadata: { role: "aggregator" },
    });
    if (error || !created.user) throw new Error(`Create aggregator user failed: ${error?.message}`);
    systemUserId = created.user.id;
    console.log(`Created aggregator user: ${aggregatorEmail}`);
  } else {
    console.log(`Reusing aggregator user: ${aggregatorEmail}`);
  }

  // 2. Employer (reuse by slug if it already exists).
  const slug = slugify(name);
  const { data: existingEmployer } = await supabase
    .from("employers")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  let employerId = (existingEmployer as { id?: string } | null)?.id;
  if (!employerId) {
    const { data: emp, error } = await supabase
      .from("employers")
      .insert([{ user_id: systemUserId, name, slug, website, location, is_verified: false }])
      .select("id")
      .single();
    if (error || !emp) throw new Error(`Create employer failed: ${error?.message}`);
    employerId = (emp as { id: string }).id;
    console.log(`Created employer "${name}" (${employerId})`);
  } else {
    console.log(`Reusing employer "${name}" (${employerId})`);
  }

  // 3. job_sources row (reuse by feed_url if present).
  const { data: existingSource } = await supabase
    .from("job_sources")
    .select("id")
    .eq("feed_url", feedUrl)
    .maybeSingle();

  if ((existingSource as { id?: string } | null)?.id) {
    const id = (existingSource as { id: string }).id;
    await supabase
      .from("job_sources")
      .update({ default_company_id: employerId, default_status: defaultStatus, enabled: true })
      .eq("id", id);
    console.log(`Updated existing source (${id}).`);
  } else {
    const { data: src, error } = await supabase
      .from("job_sources")
      .insert([
        {
          name,
          type: "ats_feed",
          base_url: website,
          feed_url: feedUrl,
          enabled: true,
          default_status: defaultStatus,
          default_company_id: employerId,
          employer_assignment_mode: "source_company",
          expiry_days: 30,
        },
      ])
      .select("id")
      .single();
    if (error || !src) throw new Error(`Create job_source failed: ${error?.message}`);
    console.log(`Created job_source (${(src as { id: string }).id}).`);
  }

  console.log("\nDone. Trigger a dry run:");
  console.log('  curl -H "Authorization: Bearer $CRON_SECRET" "$SITE/api/jobs/import?dryRun=true"');
}

main().catch((err) => {
  console.error("Setup failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
