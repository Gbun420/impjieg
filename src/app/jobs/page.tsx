import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Jobs",
  description: "Browse the latest jobs in Malta. Find tech, finance, administration, and hospitality roles with salary transparency.",
};
import SearchFilters from "@/components/jobs/search-filters";
import JobCard from "@/components/jobs/job-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { JobWithEmployer } from "@/lib/supabase/types";
import Link from "next/link";

const JOBS_PER_PAGE = 20;
const SALARY_MIN = 20000;
const SALARY_MAX = 150000;

function parseList(value: string | undefined) {
  return value ? value.split(",").map((item) => item.trim()).filter(Boolean) : [];
}

function matchesSalaryRange(job: JobWithEmployer, min: number, max: number) {
  const jobMin = job.salary_min ?? 0;
  const jobMax = job.salary_max ?? Number.MAX_SAFE_INTEGER;
  return jobMin <= max && jobMax >= min;
}

function matchesWorkType(job: JobWithEmployer, workTypes: string[]) {
  if (workTypes.length === 0) return true;
  return workTypes.some((type) => {
    if (type === "Full-time" || type === "Part-time") {
      return job.job_type === type;
    }
    return job.remote_type === type;
  });
}

function matchesExperience(job: JobWithEmployer, experience: string[]) {
  if (experience.length === 0) return true;
  const level = (job.seniority || "").toLowerCase();
  return experience.some((value) => {
    if (value === "Entry") return level.includes("entry") || level.includes("junior");
    if (value === "Mid") return level.includes("mid");
    return level.includes("senior") || level.includes("lead") || level.includes("manager");
  });
}

function filterJobs(jobs: JobWithEmployer[], params: { [key: string]: string | undefined }) {
  const query = (params.q ?? params.search ?? "").trim().toLowerCase();
  const sector = params.sector?.trim().toLowerCase() ?? "";
  const location = params.location?.trim().toLowerCase() ?? "";
  const workTypes = parseList(params.workType);
  const experience = parseList(params.experience);
  const visa = params.visa === "true";
  const salaryMin = Number(params.salaryMin ?? SALARY_MIN);
  const salaryMax = Number(params.salaryMax ?? SALARY_MAX);

  return jobs.filter((job) => {
    if (query) {
      const haystack = `${job.title} ${job.description} ${job.employers?.name ?? ""}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    if (sector && job.sector.toLowerCase() !== sector) {
      return false;
    }

    if (location && !`${job.location}`.toLowerCase().includes(location)) {
      return false;
    }

    if (visa && !job.visa_friendly) {
      return false;
    }

    if (!matchesWorkType(job, workTypes)) {
      return false;
    }

    if (!matchesExperience(job, experience)) {
      return false;
    }

    if (params.salaryMin || params.salaryMax) {
      if (!matchesSalaryRange(job, salaryMin, salaryMax)) {
        return false;
      }
    }

    return true;
  });
}

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
  searchParams: { [key: string]: string | undefined };
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

  const jobsPromise = (async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select("*, employers(id, name, slug, logo_url, location)")
      .eq("status", "active")
      .gte("expires_at", new Date().toISOString())
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });

    return { data, error };
  })();

  const [{ data: savedJobs }, { data: jobs, error }] = await Promise.all([
    savedJobsPromise,
    jobsPromise,
  ]);

  if (error || !jobs) {
    return <p className="text-sm text-muted-foreground">Error loading jobs.</p>;
  }

  const typedJobs = jobs as unknown as JobWithEmployer[];
  const filteredJobs = filterJobs(typedJobs, searchParams);
  const searchKey = new URLSearchParams(
    Object.entries(searchParams).filter(([, value]) => Boolean(value)) as [string, string][]
  ).toString();
  const page = Math.max(1, parseInt(searchParams.page || "1", 10) || 1);
  const from = (page - 1) * JOBS_PER_PAGE;
  const to = from + JOBS_PER_PAGE;
  const pageJobs = filteredJobs.slice(from, to);
  const savedJobIds = new Set((savedJobs || []).map((row) => row.job_id));

  return (
    <>
      <Suspense fallback={<SearchFiltersSkeleton />}>
        <SearchFilters key={searchKey} />
      </Suspense>
      <div className="mt-6">
        {pageJobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No jobs found matching your criteria.</p>
            <Link href="/jobs" className="mt-3 inline-flex text-sm text-primary hover:text-primary-hover transition-colors">
              Clear filters
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {filteredJobs.length} job{filteredJobs.length !== 1 ? "s" : ""} found
            </p>
            <div className="space-y-3">
              {pageJobs.map((job) => (
                <JobCard key={job.id} job={job} isSaved={savedJobIds.has(job.id)} isAuthenticated={!!user} />
              ))}
            </div>
            {to < filteredJobs.length && (
              <div className="flex justify-center pt-6">
                <Link href={buildNextPageHref(searchParams, page)}>
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
