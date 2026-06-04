import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import type { Metadata } from "next";
import SearchFilters from "@/components/jobs/search-filters";
import JobCard from "@/components/jobs/job-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { JobWithEmployer } from "@/lib/supabase/types";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse Jobs",
  description:
    "Browse the latest jobs in Malta. Find tech, finance, administration, and hospitality roles with salary clarity and direct applications.",
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  const [
    { data: savedJobs },
    { data: jobs, error, count },
  ] = await Promise.all([
    savedJobsPromise,
    query,
  ]);

  if (error || !jobs) {
    return <p className="text-sm text-muted-foreground">Error loading jobs.</p>;
  }

  const typedJobs = jobs as unknown as JobWithEmployer[];
  const searchKey = new URLSearchParams(
    Object.entries(searchParams).filter(([, value]) => Boolean(value)) as [string, string][]
  ).toString();
  const savedJobIds = new Set((savedJobs || []).map((row) => row.job_id));
  const totalJobs = count ?? typedJobs.length;
  const hasNextPage = from + typedJobs.length < totalJobs;

  return (
    <>
      <Suspense fallback={<SearchFiltersSkeleton />}>
        <SearchFilters key={searchKey} />
      </Suspense>
      <div className="mt-6">
        {typedJobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No jobs found matching your criteria.</p>
            <Link href="/jobs" className="mt-3 inline-flex text-sm text-primary hover:text-primary-hover transition-colors">
              Clear filters
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {totalJobs} job{totalJobs !== 1 ? "s" : ""} found
            </p>
            <div className="space-y-3">
              {typedJobs.map((job) => (
                <JobCard key={job.id} job={job} isSaved={savedJobIds.has(job.id)} isAuthenticated={!!user} />
              ))}
            </div>
            {hasNextPage && (
              <div className="flex justify-center pt-6">
                <Link href={buildNextPageHref({ ...searchParams, pageSize: String(pageSize) }, page)}>
                  <Button variant="outline" size="lg">Load More</Button>
                </Link>
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
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-6">
        Browse Jobs
      </h1>
      <Suspense fallback={<SearchFiltersSkeleton />}>
        <JobsContent searchParams={params} />
      </Suspense>
    </div>
  );
}
