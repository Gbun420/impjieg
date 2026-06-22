/**
 * Import runner: pulls enabled ATS sources, normalizes Malta roles, dedupes via
 * `job_import_snapshots`, and upserts into `jobs`. Logs every run to
 * `job_source_runs` and per-item failures to `job_source_errors`.
 *
 * Uses a Supabase SERVICE client (the aggregation tables are service-role only
 * per migration 009). Aggregated jobs always link OUT via `application_url`
 * and carry a source attribution line — they are never presented as direct-apply.
 *
 * Employer linkage: each source must have `default_company_id` set to an
 * `employers.id` (the schema's `employer_assignment_mode = 'source_company'`).
 * Provision that employer once with scripts/aggregator-setup-employer.ts.
 */

import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getSupabaseServiceKey, getSupabaseUrl } from "@/lib/supabase/env";
import { slugify } from "@/lib/utils";
import { sanitizeJobDescription } from "@/lib/job-description";
import { validateSalaryRange } from "@/lib/compliance";
import { insertWithUniqueSlugRetry } from "@/lib/unique-slug";
import { fetchSource } from "./sources";
import {
  contentHash,
  isMaltaJob,
  mapSector,
  normalizeJobType,
  normalizeMaltaLocation,
  normalizeRemote,
  parseSalary,
} from "./normalize";
import type { JobSource, NormalizedJob } from "./types";

// The aggregation tables may not be in the generated Database types, so we use
// a permissive structural client type (no `any`) to read/write them.
interface DbResult<T = unknown> {
  data: T | null;
  error: { message: string } | null;
}
interface QueryBuilder<T = unknown> extends PromiseLike<DbResult<T[]>> {
  select(cols?: string): QueryBuilder<T>;
  eq(col: string, val: unknown): QueryBuilder<T>;
  insert(rows: Record<string, unknown>[]): QueryBuilder<T>;
  update(vals: Record<string, unknown>): QueryBuilder<T>;
  maybeSingle(): Promise<DbResult<T>>;
  single(): Promise<DbResult<T>>;
}
interface LooseClient {
  from(table: string): QueryBuilder;
}

export interface SourceResult {
  sourceId: string;
  sourceName: string;
  fetched: number;
  imported: number;
  updated: number;
  skipped: number;
  errors: number;
  error?: string;
}

export interface ImportSummary {
  dryRun: boolean;
  sources: SourceResult[];
  totals: { fetched: number; imported: number; updated: number; skipped: number; errors: number };
}

interface RunOptions {
  dryRun?: boolean;
  sourceId?: string;
  perSourceLimit?: number;
}

function serviceClient(): LooseClient {
  return createServiceClient(getSupabaseUrl(), getSupabaseServiceKey()) as unknown as LooseClient;
}

export async function runImport(opts: RunOptions = {}): Promise<ImportSummary> {
  const { dryRun = false, sourceId, perSourceLimit } = opts;
  const supabase = serviceClient();

  let query = supabase
    .from("job_sources")
    .select("*")
    .eq("type", "ats_feed")
    .eq("enabled", true);
  if (sourceId) query = query.eq("id", sourceId);

  const { data: sources, error } = await query;
  if (error) {
    throw new Error(`Failed to load job_sources: ${error.message}`);
  }

  const results: SourceResult[] = [];
  for (const source of (sources ?? []) as JobSource[]) {
    results.push(await importSource(supabase, source, { dryRun, perSourceLimit }));
  }

  const totals = results.reduce(
    (acc, r) => ({
      fetched: acc.fetched + r.fetched,
      imported: acc.imported + r.imported,
      updated: acc.updated + r.updated,
      skipped: acc.skipped + r.skipped,
      errors: acc.errors + r.errors,
    }),
    { fetched: 0, imported: 0, updated: 0, skipped: 0, errors: 0 }
  );

  return { dryRun, sources: results, totals };
}

async function importSource(
  supabase: LooseClient,
  source: JobSource,
  opts: { dryRun: boolean; perSourceLimit?: number }
): Promise<SourceResult> {
  const { dryRun, perSourceLimit } = opts;
  const result: SourceResult = {
    sourceId: source.id,
    sourceName: source.name,
    fetched: 0,
    imported: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  };

  if (!source.default_company_id) {
    result.error = "Source has no default_company_id — provision an employer first (see docs/aggregator.md).";
    return result;
  }
  const employerId = source.default_company_id;

  // Open a run record (skipped on dry run).
  let runId: string | null = null;
  const startedAt = new Date();
  if (!dryRun) {
    const { data: run } = await supabase
      .from("job_source_runs")
      .insert([{ source_id: source.id, status: "running", started_at: startedAt.toISOString() }])
      .select("id")
      .single();
    runId = (run as { id?: string } | null)?.id ?? null;
  }

  let jobs: NormalizedJob[];
  try {
    const fetched = await fetchSource(source);
    jobs = fetched.jobs;
  } catch (err) {
    result.error = err instanceof Error ? err.message : String(err);
    result.errors = 1;
    if (!dryRun) await finalizeRun(supabase, source, runId, startedAt, result, "failed");
    return result;
  }

  const limit = Math.min(
    source.active_jobs_limit || 100,
    perSourceLimit ?? Number.MAX_SAFE_INTEGER
  );
  const slice = jobs.slice(0, limit);
  result.fetched = slice.length;

  const publishStatus = source.default_status === "confirmed" ? "active" : "draft";
  const snapshotStatus = source.default_status === "confirmed" ? "approved" : "needs_review";

  for (const job of slice) {
    try {
      if (!isMaltaJob(job)) {
        result.skipped += 1;
        continue;
      }
      await importOneJob(supabase, {
        source,
        job,
        employerId,
        publishStatus,
        snapshotStatus,
        dryRun,
        result,
      });
    } catch (err) {
      result.errors += 1;
      if (!dryRun) {
        await supabase.from("job_source_errors").insert([
          {
            source_id: source.id,
            run_id: runId,
            source_url: job.canonicalUrl || null,
            raw_title: job.title?.slice(0, 300) ?? null,
            validation_error: err instanceof Error ? err.message : String(err),
          },
        ]);
      }
    }
  }

  if (!dryRun) {
    await finalizeRun(supabase, source, runId, startedAt, result, result.errors > 0 ? "partial" : "succeeded");
  }
  return result;
}

async function importOneJob(
  supabase: LooseClient,
  args: {
    source: JobSource;
    job: NormalizedJob;
    employerId: string;
    publishStatus: "active" | "draft";
    snapshotStatus: "approved" | "needs_review";
    dryRun: boolean;
    result: SourceResult;
  }
): Promise<void> {
  const { source, job, employerId, publishStatus, snapshotStatus, dryRun, result } = args;

  const hash = contentHash(job);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (source.expiry_days || 30));

  // Dedupe by (source_id, external_id).
  const { data: existing } = await supabase
    .from("job_import_snapshots")
    .select("id, job_id, content_hash")
    .eq("source_id", source.id)
    .eq("external_id", job.externalId)
    .maybeSingle();
  const snap = existing as { id: string; job_id: string | null; content_hash: string | null } | null;

  if (dryRun) {
    if (snap) result.updated += 1;
    else result.imported += 1;
    return;
  }

  const attribution = `\n\n<p><em>Sourced from ${escapeText(source.name)}. Apply on the company's site.</em></p>`;
  const description = sanitizeJobDescription((job.description || job.title) + attribution);
  const sector = mapSector(job);
  const remoteType = normalizeRemote(job);
  const jobType = normalizeJobType(job.jobType);
  let { min: salaryMin, max: salaryMax } = parseSalary(job.description);
  if (validateSalaryRange(salaryMin, salaryMax)) {
    salaryMin = null;
    salaryMax = null;
  }

  if (snap?.job_id) {
    // Refresh the existing job (keep it live + current).
    await supabase
      .from("jobs")
      .update({
        title: job.title,
        description,
        location: normalizeMaltaLocation(job.location),
        sector,
        job_type: jobType,
        remote_type: remoteType,
        salary_min: salaryMin,
        salary_max: salaryMax,
        status: publishStatus,
        expires_at: expiresAt.toISOString(),
        application_url: job.applyUrl || job.canonicalUrl || null,
      })
      .eq("id", snap.job_id);
    await supabase
      .from("job_import_snapshots")
      .update({ content_hash: hash, last_seen_at: new Date().toISOString(), status: snapshotStatus })
      .eq("id", snap.id);
    result.updated += 1;
    return;
  }

  // Insert a fresh job with a unique slug, then record the snapshot.
  const { data: created, error: insertError } = await insertWithUniqueSlugRetry<{ id: string }>({
    baseSlug: slugify(job.title) || "role",
    insert: async (slug) =>
      (await supabase
        .from("jobs")
        .insert([
          {
            employer_id: employerId,
            title: job.title,
            slug,
            description,
            location: normalizeMaltaLocation(job.location),
            sector,
            job_type: jobType,
            seniority: null,
            remote_type: remoteType,
            salary_min: salaryMin,
            salary_max: salaryMax,
            skills: [],
            benefits: [],
            visa_friendly: false,
            is_featured: false,
            status: publishStatus,
            expires_at: expiresAt.toISOString(),
            application_email: null,
            application_url: job.applyUrl || job.canonicalUrl || null,
          },
        ])
        .select("id")
        .single()) as { data: { id: string } | null; error: { message: string } | null },
  });

  if (insertError || !created) {
    throw new Error(insertError?.message || "Job insert failed");
  }

  await supabase.from("job_import_snapshots").insert([
    {
      source_id: source.id,
      job_id: created.id,
      external_id: job.externalId,
      canonical_url: job.canonicalUrl || null,
      apply_url: job.applyUrl || null,
      content_hash: hash,
      normalized_job: job as unknown as Record<string, unknown>,
      status: snapshotStatus,
      imported_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
    },
  ]);
  result.imported += 1;
}

async function finalizeRun(
  supabase: LooseClient,
  source: JobSource,
  runId: string | null,
  startedAt: Date,
  result: SourceResult,
  status: "succeeded" | "failed" | "partial"
): Promise<void> {
  const finishedAt = new Date();
  if (runId) {
    await supabase
      .from("job_source_runs")
      .update({
        status,
        fetched_count: result.fetched,
        imported_count: result.imported,
        updated_count: result.updated,
        rejected_count: result.skipped,
        error_count: result.errors,
        error_messages: result.error ? [result.error] : [],
        runtime_ms: finishedAt.getTime() - startedAt.getTime(),
        finished_at: finishedAt.toISOString(),
      })
      .eq("id", runId);
  }
  await supabase
    .from("job_sources")
    .update({
      last_run_at: finishedAt.toISOString(),
      ...(status !== "failed" ? { last_success_at: finishedAt.toISOString() } : {}),
      ...(status === "failed" ? { last_error_at: finishedAt.toISOString() } : {}),
      health_status: status === "failed" ? "offline" : status === "partial" ? "degraded" : "healthy",
    })
    .eq("id", source.id);
}

function escapeText(value: string): string {
  return value.replace(/[<>&]/g, (c) => (c === "<" ? "&lt;" : c === ">" ? "&gt;" : "&amp;"));
}
