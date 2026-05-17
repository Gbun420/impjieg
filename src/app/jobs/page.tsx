import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import SearchFilters from "@/components/jobs/search-filters";
import JobList from "@/components/jobs/job-list";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { JobWithEmployer } from "@/lib/supabase/types";
import Link from "next/link";

const JOBS_PER_PAGE = 20;

function SearchFiltersSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
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

  let query = supabase
    .from("jobs")
    .select("*, employers(id, name, slug, logo_url, location)")
    .eq("status", "active")
    .gte("expires_at", new Date().toISOString())
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (searchParams.search) {
    query = query.or(
      `title.ilike.%${searchParams.search}%,description.ilike.%${searchParams.search}%`
    );
  }
  if (searchParams.sector) {
    query = query.eq("sector", searchParams.sector);
  }
  if (searchParams.jobType) {
    query = query.eq("job_type", searchParams.jobType);
  }
  if (searchParams.remote) {
    query = query.eq("remote_type", searchParams.remote);
  }
  if (searchParams.location) {
    query = query.ilike("location", `%${searchParams.location}%`);
  }
  if (searchParams.visa === "true") {
    query = query.eq("visa_friendly", true);
  }

  const page = parseInt(searchParams.page || "1");
  const from = (page - 1) * JOBS_PER_PAGE;
  const to = from + JOBS_PER_PAGE - 1;

  const { data: jobs, error } = await query.range(from, to);

  if (error || !jobs) {
    return <p>Error loading jobs.</p>;
  }

  const typedJobs = jobs as unknown as JobWithEmployer[];

  return (
    <>
      <Suspense fallback={<SearchFiltersSkeleton />}>
        <SearchFilters />
      </Suspense>
      <JobList jobs={typedJobs} />
      {typedJobs.length === JOBS_PER_PAGE && (
        <div className="flex justify-center pt-4">
          <Link href={`/jobs?${new URLSearchParams({ ...searchParams, page: String(page + 1) }).toString()}`}>
            <Button variant="outline">Load More</Button>
          </Link>
        </div>
      )}
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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground sm:text-3xl">
        Browse Jobs
      </h1>
      <Suspense fallback={<SearchFiltersSkeleton />}>
        <JobsContent searchParams={params} />
      </Suspense>
    </div>
  );
}
