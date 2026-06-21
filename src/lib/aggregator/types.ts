/**
 * Job aggregator types.
 *
 * The aggregator pulls postings from public ATS feeds (Greenhouse, Lever,
 * Workable) for Malta employers and imports them into the `jobs` table via the
 * migration-009 pipeline (`job_sources`, `job_source_runs`, `job_import_snapshots`).
 *
 * These local interfaces intentionally do NOT depend on the generated Supabase
 * `Database` types for the aggregation tables, so the module compiles even if
 * the generated types lag the migration. Reads/writes use a service client and
 * narrow casts, mirroring the existing repo style (see src/lib/actions/jobs.ts).
 */

export type AtsProvider = "greenhouse" | "lever" | "workable" | "teamtailor" | "smartrecruiters";

/** A `job_sources` row (subset we rely on). */
export interface JobSource {
  id: string;
  name: string;
  type:
    | "xml_feed"
    | "rss_feed"
    | "api"
    | "html_scraper"
    | "ats_feed"
    | "manual_csv";
  base_url: string | null;
  feed_url: string | null;
  enabled: boolean;
  active_jobs_limit: number;
  default_status: "confirmed" | "needs_confirmation" | "rejected";
  default_company_id: string | null;
  expiry_days: number;
  user_agent: string | null;
}

/**
 * A posting pulled from an external source, before it is mapped into the
 * `jobs` schema. `externalId` is the stable per-source identifier used for
 * dedupe via `job_import_snapshots(source_id, external_id)`.
 */
export interface NormalizedJob {
  externalId: string;
  title: string;
  /** Raw HTML or text from the source; sanitized at import time. */
  description: string;
  location: string;
  /** Outbound application link (aggregated jobs link out, never direct-apply). */
  applyUrl: string;
  /** Canonical source posting URL. */
  canonicalUrl: string;
  remoteType: "Remote" | "Hybrid" | "On-site" | null;
  jobType: string | null;
  /** External department/category — input to sector mapping. */
  department: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  /** ISO timestamp of the original posting, when the source exposes it. */
  postedAt: string | null;
}

/** Result of a single source fetch. */
export interface SourceFetchResult {
  jobs: NormalizedJob[];
  provider: AtsProvider;
}
