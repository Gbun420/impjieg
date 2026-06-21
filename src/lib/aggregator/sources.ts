/**
 * ATS source adapters: fetch + parse public job feeds into NormalizedJob[].
 *
 * Provider is detected from the source's `feed_url` host, so no schema change
 * is needed — operators just paste the public ATS URL. Supported shapes:
 *
 *   Greenhouse: https://boards-api.greenhouse.io/v1/boards/{token}/jobs?content=true
 *   Lever:      https://api.lever.co/v0/postings/{company}?mode=json
 *   Workable:   https://apply.workable.com/api/v1/widget/accounts/{subdomain}?details=true
 *
 * Greenhouse and Lever expose stable, documented, auth-free JSON APIs. The
 * Workable widget endpoint is public but less formally documented — verify it
 * returns the expected shape for a given account before enabling that source.
 *
 * Every fetch is defensive: it times out, checks status, and tolerates missing
 * fields rather than throwing, so one bad source never breaks a run.
 */

import type { AtsProvider, JobSource, NormalizedJob, SourceFetchResult } from "./types";

const DEFAULT_TIMEOUT_MS = 20_000;
const DEFAULT_UA = "ImpjiegJobAggregator/1.0 (+https://impjieg.work)";

export function detectProvider(feedUrl: string): AtsProvider | null {
  let host = "";
  try {
    host = new URL(feedUrl).host.toLowerCase();
  } catch {
    return null;
  }
  if (host.includes("greenhouse.io")) return "greenhouse";
  if (host.includes("lever.co")) return "lever";
  if (host.includes("workable.com")) return "workable";
  return null;
}

async function fetchJson(url: string, userAgent: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": userAgent },
      signal: controller.signal,
      // Aggregated feeds change often; never serve a stale cache.
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} from ${url}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/** Decode the HTML entities Greenhouse returns in `content`. */
function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

// ---- Greenhouse ----------------------------------------------------------

function parseGreenhouse(payload: unknown): NormalizedJob[] {
  const jobs = asArray((payload as { jobs?: unknown })?.jobs);
  return jobs
    .map((raw): NormalizedJob | null => {
      const j = raw as Record<string, unknown>;
      const id = j.id != null ? String(j.id) : "";
      const title = str(j.title);
      if (!id || !title) return null;
      const location = str((j.location as { name?: string } | undefined)?.name);
      const departments = asArray(j.departments)
        .map((d) => str((d as { name?: string }).name))
        .filter(Boolean);
      return {
        externalId: id,
        title,
        description: decodeHtmlEntities(str(j.content)),
        location,
        applyUrl: str(j.absolute_url),
        canonicalUrl: str(j.absolute_url),
        remoteType: null,
        jobType: null,
        department: departments[0] || null,
        salaryMin: null,
        salaryMax: null,
        postedAt: str(j.updated_at) || null,
      };
    })
    .filter((j): j is NormalizedJob => j !== null);
}

// ---- Lever ---------------------------------------------------------------

function parseLever(payload: unknown): NormalizedJob[] {
  return asArray(payload)
    .map((raw): NormalizedJob | null => {
      const j = raw as Record<string, unknown>;
      const id = str(j.id);
      const title = str(j.text);
      if (!id || !title) return null;
      const categories = (j.categories as Record<string, unknown>) || {};
      const description = str(j.description) || str(j.descriptionPlain);
      const createdAt = typeof j.createdAt === "number" ? new Date(j.createdAt).toISOString() : null;
      return {
        externalId: id,
        title,
        description,
        location: str(categories.location),
        applyUrl: str(j.applyUrl) || str(j.hostedUrl),
        canonicalUrl: str(j.hostedUrl),
        remoteType: null,
        jobType: str(categories.commitment) || null,
        department: str(categories.department) || str(categories.team) || null,
        salaryMin: null,
        salaryMax: null,
        postedAt: createdAt,
      };
    })
    .filter((j): j is NormalizedJob => j !== null);
}

// ---- Workable (public widget API; verify per account) --------------------

function parseWorkable(payload: unknown): NormalizedJob[] {
  const jobs = asArray((payload as { jobs?: unknown })?.jobs);
  return jobs
    .map((raw): NormalizedJob | null => {
      const j = raw as Record<string, unknown>;
      const id = str(j.shortcode) || str(j.id);
      const title = str(j.title);
      if (!id || !title) return null;
      const loc = (j.location as Record<string, unknown>) || {};
      const telecommuting = Boolean(loc.telecommuting ?? j.telecommuting);
      const city = str(loc.city);
      const country = str(loc.country);
      const location = [city, country].filter(Boolean).join(", ") || (telecommuting ? "Remote" : "");
      return {
        externalId: id,
        title,
        description: str(j.description),
        location,
        applyUrl: str(j.application_url) || str(j.url),
        canonicalUrl: str(j.url),
        remoteType: telecommuting ? "Remote" : null,
        jobType: str(j.employment_type) || null,
        department: str(j.department) || null,
        salaryMin: null,
        salaryMax: null,
        postedAt: str(j.created_at) || null,
      };
    })
    .filter((j): j is NormalizedJob => j !== null);
}

/** Fetch + parse one source by its `feed_url`. Throws on network/parse failure. */
export async function fetchSource(source: JobSource): Promise<SourceFetchResult> {
  if (!source.feed_url) {
    throw new Error(`Source "${source.name}" has no feed_url`);
  }
  const provider = detectProvider(source.feed_url);
  if (!provider) {
    throw new Error(`Could not detect ATS provider from feed_url: ${source.feed_url}`);
  }
  const ua = source.user_agent || DEFAULT_UA;
  const payload = await fetchJson(source.feed_url, ua);

  let jobs: NormalizedJob[];
  if (provider === "greenhouse") jobs = parseGreenhouse(payload);
  else if (provider === "lever") jobs = parseLever(payload);
  else jobs = parseWorkable(payload);

  return { jobs, provider };
}
