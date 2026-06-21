# Job Aggregator (ATS feed import)

> **Status:** Built, not yet run against live feeds.
> **Purpose:** Fill the board with real Malta jobs by importing public ATS feeds, so the marketplace has inventory before the employer base exists.
> **Owner:** Impjieg maintainers (this touches the migration-009 ingestion pipeline).

## What it does

Pulls job postings from public ATS feeds (Greenhouse, Lever, Workable) for Malta
employers, normalizes them onto our `jobs` schema, dedupes, and imports them as
live (or draft) jobs. It reuses the dormant **migration 009** tables:
`job_sources` (config), `job_source_runs` (run log), `job_import_snapshots`
(dedupe by `(source_id, external_id)` + `content_hash`), `job_source_errors`.

Aggregated jobs **always link out** via `application_url` and carry a
"Sourced from {company}" line — they are never presented as direct-apply.

## Pipeline

```
/api/jobs/import (cron, CRON_SECRET-guarded)
  └─ runImport()                      src/lib/aggregator/import-runner.ts
       ├─ load enabled type='ats_feed' job_sources
       ├─ fetchSource()               src/lib/aggregator/sources.ts   (provider from feed_url)
       ├─ isMaltaJob / mapSector / normalize…   src/lib/aggregator/normalize.ts
       ├─ dedupe via job_import_snapshots
       ├─ insert/refresh jobs (sanitized, salary-validated, unique slug)
       └─ log job_source_runs / job_source_errors
```

## Feed URL formats (paste into `job_sources.feed_url`; provider auto-detected)

| Provider   | `feed_url` |
|------------|-----------|
| Greenhouse | `https://boards-api.greenhouse.io/v1/boards/{token}/jobs?content=true` |
| Lever      | `https://api.lever.co/v0/postings/{company}?mode=json` |
| Workable   | `https://apply.workable.com/api/v1/widget/accounts/{subdomain}?details=true` |
| Teamtailor | `https://{company}.teamtailor.com/jobs.json` |
| SmartRecruiters | `https://api.smartrecruiters.com/v1/companies/{id}/postings?limit=100` |

> **Verify every source before enabling it.** Greenhouse and Lever are stable,
> documented, auth-free JSON APIs. Workable's public widget endpoint is less
> formal — confirm it returns the expected shape for the specific account. Do
> not assume a given Malta company uses a given ATS; check its careers page.
> Prefer official feeds/ATS APIs over scraping, and respect each site's ToS.

## Quick seed (verified Malta sources)

To wire all the curl-verified Malta feeds at once (Betsson, Kaizen Gaming, Nium,
BrainRocket, Soft2Bet, EveryMatrix), run:

```bash
# imports as drafts for review by default; add SEED_DEFAULT_STATUS=confirmed to publish live
SEED_DEFAULT_STATUS=confirmed npx tsx scripts/aggregator-seed-malta-sources.ts
```

Then dry-run the import (below). To add one source by hand, use the per-company
script instead.

## Setup (per company)

Requires service-role env (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).

```bash
SOURCE_NAME="Acme Malta" \
SOURCE_FEED_URL="https://boards-api.greenhouse.io/v1/boards/acme/jobs?content=true" \
SOURCE_WEBSITE="https://acme.com" \
DEFAULT_STATUS="needs_confirmation" \
npx tsx scripts/aggregator-setup-employer.ts
```

This provisions a system `aggregator@impjieg.work` auth user (once), an
`employers` row for the company, and the `job_sources` row linked via
`default_company_id`. `employers.user_id` is NOT NULL, which is why the system
user is required.

- `DEFAULT_STATUS="confirmed"` → imported jobs go straight to `status='active'` (public).
- `DEFAULT_STATUS="needs_confirmation"` → jobs import as `draft` for review first.

## Verify (dry run — no writes)

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  "https://impjieg.work/api/jobs/import?dryRun=true"
# or one source: ...&sourceId={uuid}&limit=10
```

Returns per-source `{ fetched, imported, updated, skipped, errors }`. When it
looks right, flip the source to `confirmed` and let the cron run.

## Schedule

`vercel.json` runs `/api/jobs/import` every 6 hours (`0 */6 * * *`). Each run
refreshes `expires_at` on jobs it still sees, so live roles stay fresh and
stale ones expire out of the listings.

## Env

| Var | Use |
|-----|-----|
| `CRON_SECRET` | Bearer token for the cron route (already used by other crons) |
| `SUPABASE_SERVICE_ROLE_KEY` | service client for aggregation tables + jobs writes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `AGGREGATOR_EMAIL` | optional; system employer-owner user (default `aggregator@impjieg.work`) |

## Safety / guardrails (preserved)

- Descriptions sanitized via `sanitizeJobDescription` before storage (XSS).
- Salary parsed best-effort and dropped if it fails `validateSalaryRange`.
- Aggregation tables are service-role-only (RLS) — the route is `CRON_SECRET`-guarded.
- No candidate PII; aggregated jobs store no `application_email` (link out only).
- Malta-only: non-Malta roles are skipped (`isMaltaJob`).
