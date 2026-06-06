import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Suspense } from "react";
import SearchFilters from "@/components/jobs/search-filters";
import JobCard from "@/components/jobs/job-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { deriveEmployerComplianceSummary } from "@/lib/compliance";
import {
  Banknote,
  Clock,
  ArrowRight,
  Building2,
  Shield,
  TrendingUp,
  Users,
  CheckCircle2,
} from "lucide-react";
import type { JobWithEmployer } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const HOMEPAGE_SECTORS = [
  "iGaming",
  "Technology",
  "Legal & Compliance",
  "Finance & Banking",
  "Marketing & Media",
  "Retail & E-commerce",
] as const;

async function StatsSection() {
  const supabase = await createClient();
  const { data: jobs } = await supabase
    .from("jobs")
    .select("status, salary_min, salary_max, expires_at")
    .eq("status", "active")
    .gte("expires_at", new Date().toISOString());

  const salaryCoverage = deriveEmployerComplianceSummary((jobs || []) as Array<{
    status: "active";
    salary_min: number | null;
    salary_max: number | null;
  }>);

  return (
    <div className="flex items-center justify-center gap-6 sm:gap-10 text-sm">
      <div className="text-center">
        <p className="text-2xl sm:text-3xl font-bold text-foreground">{salaryCoverage.activeJobs}</p>
        <p className="text-foreground/75 mt-0.5">Active jobs</p>
      </div>
      <div className="h-8 w-px bg-border" />
      <div className="text-center">
        <p className="text-2xl sm:text-3xl font-bold text-foreground">{salaryCoverage.salaryCoveragePercent}%</p>
        <p className="text-foreground/75 mt-0.5">Listings with salary ranges</p>
      </div>
      <div className="h-8 w-px bg-border" />
      <div className="text-center">
        <p className="text-2xl sm:text-3xl font-bold text-foreground">30d</p>
        <p className="text-foreground/75 mt-0.5">30-day expiry</p>
      </div>
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
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(12);

  if (!jobs || jobs.length === 0) {
    return null;
  }

  const typedJobs = jobs as unknown as JobWithEmployer[];
  const featuredJobs = typedJobs.filter((job) => job.is_featured);
  const standardJobs = typedJobs.filter((job) => !job.is_featured);
  const displayJobs = [
    ...featuredJobs.slice(0, 3),
    ...standardJobs.slice(0, 2),
  ].slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Latest Jobs</h2>
          <p className="text-sm text-muted-foreground mt-1">Fresh opportunities updated regularly</p>
        </div>
        <Link href="/jobs" className="group flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          View all <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
      <div className="space-y-3">
        {displayJobs.map((job) => (
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
      <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-6">
              <TrendingUp className="h-3.5 w-3.5" />
              Made in Malta
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Malta&apos;s modern jobs marketplace for{" "}
              <span className="text-gradient">tech, digital, and iGaming talent.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base sm:text-lg text-muted-foreground">
              Discover Malta&apos;s tech, digital, and iGaming roles with salary clarity, work-mode filters, and direct employer applications.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-xl animate-fade-in-up stagger-2">
            <Suspense fallback={<Skeleton className="mx-auto h-10 w-full" />}>
              <SearchFilters />
            </Suspense>
          </div>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row animate-fade-in-up stagger-2">
            <Link href="/jobs">
              <Button variant="primary" size="lg">
                Find Jobs
              </Button>
            </Link>
            <Link href="/employer/post-job">
              <Button variant="outline" size="lg">
                Hire Talent
              </Button>
            </Link>
          </div>

          <div className="mt-10 animate-fade-in-up stagger-3">
            <Suspense fallback={<Skeleton className="h-20 w-full max-w-md mx-auto" />}>
              <StatsSection />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Trusted by */}
      <section className="border-y border-border py-6 sm:py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span>Verified employers</span>
            </div>
            <div className="hidden sm:block h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>Salary transparency</span>
            </div>
            <div className="hidden sm:block h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>Regularly updated</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[1.75rem] border border-border bg-card p-6 sm:p-8 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                For employers
              </p>
              <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Hire better candidates without agency-level fees.
              </h2>
              <p className="mt-3 max-w-2xl text-sm sm:text-base leading-7 text-muted-foreground">
                Post salary-transparent roles, boost urgent vacancies, and review applicants from one clean Malta hiring dashboard.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/employer/post-job">
                  <Button variant="primary" size="lg">
                    Start Hiring
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline" size="lg">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {[
                {
                  title: "Paid visibility",
                  copy: "Give urgent roles stronger placement across the marketplace.",
                  icon: TrendingUp,
                },
                {
                  title: "Screening support",
                  copy: "Add candidate checks when a role needs a tighter shortlist.",
                  icon: Shield,
                },
                {
                  title: "Hiring analytics",
                  copy: "See what is getting views, clicks, and applications faster.",
                  icon: Users,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-[1.5rem] border border-border bg-surface p-5 shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{item.copy}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Sector */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Browse key sectors</h2>
              <p className="text-sm text-muted-foreground mt-1">Focus on the industries that move Malta hiring forward</p>
            </div>
            <Link href="/jobs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              All sectors <ArrowRight className="inline h-3.5 w-3.5 ml-0.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {HOMEPAGE_SECTORS.map((sector) => (
              <Link
                key={sector}
                href={`/jobs?sector=${encodeURIComponent(sector)}`}
                className="group rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-all hover:-translate-y-0.5 hover:border-border-hover hover:bg-card-hover hover:shadow-sm"
              >
                {sector}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Jobs */}
      <section className="border-t border-border py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <LatestJobs />
          </Suspense>
        </div>
      </section>

      {/* Why Impjieg */}
      <section className="border-t border-border bg-muted/30 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Why Impjieg</h2>
            <p className="text-sm text-muted-foreground mt-1">Built around clarity, speed, and trust</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Banknote className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-3 text-base font-semibold text-foreground">
                Salary clarity
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                Every listing shows a salary range up front, so candidates can judge fit before they apply.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-3 text-base font-semibold text-foreground">
                Fresh listings
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                Jobs expire after 30 days, keeping the marketplace current and useful.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-3 text-base font-semibold text-foreground">
                Direct applications
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                Apply directly to employers. No middlemen, no hidden steps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Hiring? Post roles that get seen.
          </h2>
          <p className="mt-2 text-base text-muted-foreground">
            Reach Malta&apos;s best-fit candidates with salary clarity, stronger visibility, and a cleaner application flow.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/employer/post-job">
              <Button variant="primary" size="lg">
                Start Hiring
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
