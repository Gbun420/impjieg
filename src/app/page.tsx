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
  Sparkles,
  Shield,
  Zap,
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

const sectorIcons: Record<string, typeof Sparkles> = {
  Technology: Zap,
  Finance: Banknote,
  Healthcare: Shield,
  iGaming: Sparkles,
};

async function StatsSection() {
  const supabase = await createClient();
  const { count } = await supabase
    .from("jobs")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")
    .gte("expires_at", new Date().toISOString());

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 text-center transition-all hover:border-primary/30"
        >
          <stat.icon className="mx-auto h-5 w-5 text-primary" />
          <p className="mt-2 text-xl font-bold font-mono bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
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
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Latest Jobs</h2>
        <Link href="/jobs" className="group flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
          View all <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
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
      <section className="relative overflow-hidden border-b border-border/50 bg-gradient-to-b from-muted/30 to-background py-20 sm:py-28 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <div className="animate-fade-in">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-7xl">
              Your next role,{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">sorted.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground sm:text-xl">
              Malta&apos;s modern job board with salary transparency. Find your
              next opportunity or hire your next team member.
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-2xl animate-fade-in stagger-2">
            <Suspense fallback={<Skeleton className="mx-auto h-11 w-full max-w-md" />}>
              <SearchFilters />
            </Suspense>
          </div>
          <div className="mx-auto mt-10 max-w-md animate-fade-in stagger-3">
            <Suspense fallback={<Skeleton className="h-24 w-full" />}>
              <StatsSection />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Browse by Sector */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Browse by Sector
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {SECTORS.slice(0, 8).map((sector, i) => {
              const Icon = sectorIcons[sector] || Sparkles;
              return (
                <Link
                  key={sector}
                  href={`/jobs?sector=${encodeURIComponent(sector)}`}
                  className={`group rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 text-center transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 animate-fade-in stagger-${Math.min(i + 1, 5)}`}
                >
                  <Icon className="mx-auto h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  <p className="mt-2 text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {sector}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Latest Jobs */}
      <section className="border-t border-border/50 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <LatestJobs />
          </Suspense>
        </div>
      </section>

      {/* Why Impjieg */}
      <section className="border-t border-border/50 bg-muted/20 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold tracking-tight text-foreground">
            Why Impjieg
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            <div className="group rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-7 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
                <Banknote className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                Salary Transparency
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Every listing shows verified salary ranges. No more guessing what you&apos;re worth.
              </p>
            </div>
            <div className="group rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-7 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                Fresh Listings
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Jobs expire after 30 days. No stale listings cluttering your search.
              </p>
            </div>
            <div className="group rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-7 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                Direct Applications
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Apply directly to employers. No middlemen, no hidden steps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-border/50 py-20 sm:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
            <Building2 className="h-7 w-7 text-primary" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Hiring? Post your first job free.
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Reach Malta&apos;s top talent in minutes.
          </p>
          <div className="mt-8 flex justify-center gap-3">
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
