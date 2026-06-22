import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import type { Metadata } from "next";
import SearchFilters from "@/components/jobs/search-filters";
import JobCard from "@/components/jobs/job-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { JobWithEmployer } from "@/lib/supabase/types";
import Link from "next/link";
import { Briefcase } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Malta Jobs | Tech, iGaming, Finance & Compliance Roles | Impjieg",
  description:
    "Browse Malta jobs with clearer salary, work-mode, employer, and freshness signals on Impjieg.",
  alternates: {
    canonical: "https://impjieg.vercel.app/jobs",
  },
};

const DEFAULT_JOBS_PER_PAGE = 20;
const MAX_JOBS_PER_PAGE = 50;
const SALARY_MIN = 20000;
const SALARY_MAX = 150000;

function parseList(value: string | undefined) {
  return value ? value.split(",").map((item) => item.trim()).filter(Boolean) : [];
}

function normalizePageSize(value: string | undefined) {
  const parsed = Number.parseInt(value || "", 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return DEFAULT_JOBS_PER_PAGE;
  }

  return Math.min(parsed, MAX_JOBS_PER_PAGE);
}

function sanitizePage(value: string | undefined) {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function buildLocationPatterns(location: string) {
  if (!location.trim()) {
    return [];
  }

  const normalized = location.trim();
  const escaped = normalized.replace(/[%_]/g, "\\$&");
  return [
    normalized,
    `${normalized},%`,
    `%, ${normalized}`,
    `%,${normalized}`,
    `%${normalized}%`,
    `%${escaped}%`,
  ];
}

type JobPageSearchParams = { [key: string]: string | undefined };

function buildNextPageHref(
  searchParams: { [key: string]: string | undefined },
  page: number
) {
  const nextParams = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) {
      nextParams.set(key, value);
    }
  });
  nextParams.set("page", String(page + 1));
  return `/jobs?${nextParams.toString()}`;
}

function SearchFiltersSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
}

async function JobsContent({
  searchParams,
}: {
  searchParams: JobPageSearchParams;
}) {
  const supabase = await createClient();

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    user = null;
  }

  const savedJobsPromise = user
    ? (async () => {
        const { data } = await supabase
          .from("saved_jobs")
          .select("job_id")
          .eq("user_id", user.id);
        return { data: (data || []) as { job_id: string }[] };
      })()
    : Promise.resolve({ data: [] as { job_id: string }[] });

  const query = supabase
    .from("jobs")
    .select("*, employers(id, name, slug, logo_url, location)", { count: "exact" })
    .eq("status", "active")
    .gte("expires_at", new Date().toISOString())
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  const queryText = (searchParams.q ?? searchParams.search ?? "").trim();
  const sector = searchParams.sector?.trim();
  const location = searchParams.location?.trim();
  const workTypes = parseList(searchParams.workType);
  const experience = parseList(searchParams.experience);
  const visa = searchParams.visa === "true";
  const salaryMin = Number(searchParams.salaryMin ?? SALARY_MIN);
  const salaryMax = Number(searchParams.salaryMax ?? SALARY_MAX);
  const page = sanitizePage(searchParams.page);
  const pageSize = normalizePageSize(searchParams.pageSize);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  if (queryText) {
    const escapedQuery = queryText.replace(/[%_,]/g, "\\$&");
    query.or(
      [
        `title.ilike.%${escapedQuery}%`,
        `description.ilike.%${escapedQuery}%`,
        `sector.ilike.%${escapedQuery}%`,
        `location.ilike.%${escapedQuery}%`,
      ].join(",")
    );
  }

  if (sector) {
    query.eq("sector", sector);
  }

  if (location) {
    const patterns = buildLocationPatterns(location);
    if (patterns.length > 0) {
      query.or(patterns.map((pattern) => `location.ilike.${pattern}`).join(","));
    }
  }

  if (visa) {
    query.eq("visa_friendly", true);
  }

  if (workTypes.length > 0) {
    const remoteModes = workTypes.filter((type) => type === "Remote" || type === "Hybrid" || type === "On-site");
    const jobTypes = workTypes.filter((type) => type === "Full-time" || type === "Part-time");

    if (jobTypes.length > 0 && remoteModes.length === 0) {
      query.in("job_type", jobTypes);
    } else if (remoteModes.length > 0 && jobTypes.length === 0) {
      query.in("remote_type", remoteModes);
    } else if (jobTypes.length > 0 && remoteModes.length > 0) {
      query.or(`job_type.in.(${jobTypes.join(",")}),remote_type.in.(${remoteModes.join(",")})`);
    }
  }

  if (experience.length > 0) {
    const seniorityFilters = experience.flatMap((value) => {
      if (value === "Entry") {
        return ["seniority.ilike.%entry%", "seniority.ilike.%junior%"];
      }
      if (value === "Mid") {
        return ["seniority.ilike.%mid%"];
      }
      return ["seniority.ilike.%senior%", "seniority.ilike.%lead%", "seniority.ilike.%manager%"];
    });

    query.or(seniorityFilters.join(","));
  }

  if (searchParams.salaryMin || searchParams.salaryMax) {
    query
      .lte("salary_min", salaryMax)
      .gte("salary_max", salaryMin);
  }

  query.range(from, to);

  let jobsData: JobWithEmployer[] | null = null;
  let jobsError: { message: string } | null = null;
  let jobsCount: number | null = null;

  try {
    const result = await query;
    jobsData = result.data as unknown as JobWithEmployer[] | null;
    jobsError = result.error;
    jobsCount = result.count;
  } catch (err) {
    jobsError = { message: err instanceof Error ? err.message : 'Failed to load jobs' };
  }

  const [
    { data: savedJobs },
  ] = await Promise.all([
    savedJobsPromise,
  ]);

  if (jobsError || !jobsData) {
    return (
      <div className="mt-6 rounded-2xl border border-border bg-card px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground">We couldn&apos;t load roles right now. Please refresh in a moment.</p>
      </div>
    );
  }

  const typedJobs = jobsData;
  const searchKey = new URLSearchParams(
    Object.entries(searchParams).filter(([, value]) => Boolean(value)) as [string, string][]
  ).toString();
  const savedJobIds = new Set((savedJobs || []).map((row) => row.job_id));
  const totalJobs = jobsCount ?? typedJobs.length;
  const hasNextPage = from + typedJobs.length < totalJobs;
  const hasFilters = Boolean(
    queryText || sector || location || workTypes.length > 0 || experience.length > 0 || visa || searchParams.salaryMin || searchParams.salaryMax
  );

  return (
    <>
      <Suspense fallback={<SearchFiltersSkeleton />}>
        <SearchFilters key={searchKey} />
      </Suspense>
      <div className="mt-6">
        {typedJobs.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/20">
              <Briefcase className="h-7 w-7 text-[#141210]" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-foreground">
              {hasFilters ? "No roles match your filters" : "No live roles just yet"}
            </h2>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
              {hasFilters
                ? "Try widening your search — clear a filter or two and check again."
                : "New Malta roles are added regularly. Set a free alert and we'll email you the moment something fits."}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {hasFilters ? (
                <Button asChild variant="primary" size="lg">
                  <Link href="/jobs">Clear filters</Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="primary" size="lg">
                    <Link href="/alerts">Set a job alert</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/jobs/sector/igaming">Browse iGaming roles</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm font-medium text-muted-foreground">
              {totalJobs} live role{totalJobs !== 1 ? "s" : ""} found across the marketplace
            </p>
            <div className="space-y-3">
              {typedJobs.map((job) => (
                <JobCard key={job.id} job={job} isSaved={savedJobIds.has(job.id)} isAuthenticated={!!user} />
              ))}
            </div>
            {hasNextPage && (
              <div className="flex justify-center pt-6">
                <Button asChild variant="outline" size="lg">
                  <Link href={buildNextPageHref({ ...searchParams, pageSize: String(pageSize) }, page)}>
                    Load More
                  </Link>
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Malta job marketplace</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-[-0.03em] text-foreground sm:text-5xl">
          Jobs in Malta
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          Browse Malta&apos;s tech, digital, iGaming, finance and compliance roles with clear salary, work-mode and employer signals — filter by salary, location, and work mode.
        </p>
      </header>
      <Suspense fallback={<SearchFiltersSkeleton />}>
        <JobsContent searchParams={params} />
      </Suspense>
    </div>
  );
}
