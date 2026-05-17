import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Suspense } from "react";
import SearchFilters from "@/components/jobs/search-filters";
import JobCard from "@/components/jobs/job-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Banknote,
  Clock,
  ArrowRight,
  Building2,
  Search,
  Mail,
} from "lucide-react";
import { SECTORS } from "@/lib/constants";
import type { JobWithEmployer } from "@/lib/supabase/types";

const stats = [
  {
    label: "Active Jobs",
    value: "jobs",
    icon: Search,
  },
  {
    label: "Verified Salaries",
    value: "100%",
    icon: Banknote,
  },
  {
    label: "Fresh Daily",
    value: "New",
    icon: Clock,
  },
];

async function StatsSection() {
  const supabase = await createClient();
  const { count } = await supabase
    .from("jobs")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")
    .gte("expires_at", new Date().toISOString());

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-border bg-card p-4 text-center"
        >
          <stat.icon className="mx-auto h-5 w-5 text-secondary" />
          <p className="mt-2 text-xl font-bold font-mono text-foreground">
            {stat.value === "jobs" ? count ?? 0 : stat.value}
          </p>
          <p className="text-xs text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

async function LatestJobs() {
  const supabase = await createClient();
  const { data: jobs } = await supabase
    .from("jobs")
    .select("*, employers(id, name, slug, logo_url, location)")
    .eq("status", "active")
    .gte("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(6);

  if (!jobs || jobs.length === 0) {
    return null;
  }

  const typedJobs = jobs as unknown as JobWithEmployer[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Latest Jobs</h2>
        <Link href="/jobs" className="text-sm text-secondary hover:underline">
          View all <ArrowRight className="ml-1 inline h-4 w-4" />
        </Link>
      </div>
      <div className="space-y-3">
        {typedJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}

export default async function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-primary/[0.03] to-background py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Your next role,{" "}
            <span className="text-secondary">sorted.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Malta&apos;s modern job board with salary transparency. Find your
            next opportunity or hire your next team member.
          </p>
          <div className="mx-auto mt-8 max-w-2xl">
            <Suspense
              fallback={
                <Skeleton className="mx-auto h-10 w-full max-w-md" />
              }
            >
              <SearchFilters />
            </Suspense>
          </div>
          <div className="mx-auto mt-8 max-w-md">
            <Suspense fallback={<Skeleton className="h-24 w-full" />}>
              <StatsSection />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Browse by Sector */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-foreground">
            Browse by Sector
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {SECTORS.slice(0, 8).map((sector) => (
              <Link
                key={sector}
                href={`/jobs?sector=${encodeURIComponent(sector)}`}
                className="rounded-lg border border-border bg-card p-4 text-center text-sm font-medium text-foreground transition-colors hover:border-secondary hover:text-secondary"
              >
                {sector}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Jobs */}
      <section className="border-t border-border py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <LatestJobs />
          </Suspense>
        </div>
      </section>

      {/* Why Impjieg */}
      <section className="border-t border-border bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-xl font-bold text-foreground">
            Why Impjieg
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-6">
              <Banknote className="h-8 w-8 text-secondary" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                Salary Transparency
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Every listing shows verified salary ranges. No more guessing.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <Clock className="h-8 w-8 text-secondary" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                Fresh Listings
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Jobs expire after 30 days. No stale listings cluttering your
                search.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <Mail className="h-8 w-8 text-secondary" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                Direct Applications
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Apply directly to employers. No middlemen, no hidden steps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <Building2 className="mx-auto h-12 w-12 text-secondary" />
          <h2 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
            Hiring? Post your first job free.
          </h2>
          <p className="mt-2 text-muted-foreground">
            Reach Malta&apos;s top talent in minutes.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/employer/post-job">
              <Button variant="primary" size="lg">
                Post a Job
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
