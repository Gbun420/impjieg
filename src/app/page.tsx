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
    <div className="flex items-center justify-center gap-6 text-sm text-foreground sm:gap-10">
      <div className="text-center">
        <p className="text-2xl font-bold text-foreground sm:text-3xl">{salaryCoverage.activeJobs}</p>
        <p className="mt-0.5 text-muted-foreground">Active jobs</p>
      </div>
      <div className="h-8 w-px bg-border" />
      <div className="text-center">
        <p className="text-2xl font-bold text-primary sm:text-3xl">{salaryCoverage.salaryCoveragePercent}%</p>
        <p className="mt-0.5 text-muted-foreground">Salary coverage</p>
      </div>
      <div className="h-8 w-px bg-border" />
      <div className="text-center">
        <p className="text-2xl font-bold text-foreground sm:text-3xl">30d</p>
        <p className="mt-0.5 text-muted-foreground">Freshness window</p>
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
      <section className="relative isolate overflow-hidden bg-harbor py-16 text-foreground sm:py-24 lg:py-28">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_18%,rgba(30,99,255,0.24),transparent_28%),radial-gradient(circle_at_85%_12%,rgba(20,199,183,0.16),transparent_30%)]" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.88fr] lg:px-8">
          <div className="animate-fade-in-up">
            <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <TrendingUp className="h-3.5 w-3.5" />
              Malta hiring signal
            </div>
            <h1 className="max-w-3xl text-4xl font-bold tracking-[-0.055em] text-foreground sm:text-5xl lg:text-6xl">
              The sharper marketplace for Malta&apos;s tech, digital, and iGaming careers.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
              Impjieg brings salary signals, work-mode clarity, verified employer context, and direct apply paths into one premium Malta hiring workspace.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/jobs">
                <Button variant="primary" size="lg">
                  Find better roles
                </Button>
              </Link>
              <Link href="/employer/post-job">
                <Button variant="outline" size="lg" className="border-primary/30 bg-primary/5 text-primary hover:bg-primary/10">
                  Hire Malta talent
                </Button>
              </Link>
            </div>

            <div className="mt-10">
              <Suspense fallback={<Skeleton className="h-20 w-full max-w-md" />}>
                <StatsSection />
              </Suspense>
            </div>
          </div>

          <div className="animate-fade-in-up stagger-2">
            <div className="rounded-[2rem] border border-border/30 bg-card/50 p-4 shadow-[0_28px_90px_rgba(11,18,32,0.15)] backdrop-blur">
              <div className="rounded-[1.5rem] border border-border/30 bg-background/80 p-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Marketplace pulse</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">Live Malta roles</p>
                  </div>
                  <span className="rounded-full bg-lagoon/15 px-3 py-1 text-xs font-semibold text-lagoon">Updated</span>
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    ["Product designer", "Sliema · Hybrid", "EUR 42k - 55k"],
                    ["Compliance analyst", "St Julian's · On-site", "EUR 36k - 48k"],
                    ["Senior React engineer", "Malta / EU · Remote", "EUR 62k - 78k"],
                  ].map(([title, meta, salary]) => (
                    <div key={title} className="rounded-2xl border border-border/30 bg-card/50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">{title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{meta}</p>
                        </div>
                        <p className="shrink-0 font-mono text-sm font-semibold text-primary">{salary}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-2xl border border-border/30 bg-card/50 p-4">
                  <Suspense fallback={<Skeleton className="h-28 w-full" />}>
                    <SearchFilters />
                  </Suspense>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by */}
      <section className="border-y border-border bg-muted/30 py-6 sm:py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span>Employer context</span>
            </div>
            <div className="hidden sm:block h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>Salary transparency</span>
            </div>
            <div className="hidden sm:block h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>Fresh market signal</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="marketplace-panel rounded-[1.75rem] p-6 sm:p-8">
              <p className="brand-eyebrow text-primary">
                For employers
              </p>
              <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Build a stronger Malta hiring pipeline without agency-level drag.
              </h2>
              <p className="mt-3 max-w-2xl text-sm sm:text-base leading-7 text-muted-foreground">
                Publish polished roles, surface salary and work-mode expectations, boost urgent vacancies, and review applicants from one clean employer workspace.
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
                  <div key={item.title} className="marketplace-panel rounded-[1.5rem] p-5">
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
                className="group rounded-2xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card-hover hover:shadow-sm"
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
            <div className="marketplace-panel rounded-[1.35rem] p-6">
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
            <div className="marketplace-panel rounded-[1.35rem] p-6">
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
            <div className="marketplace-panel rounded-[1.35rem] p-6">
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
