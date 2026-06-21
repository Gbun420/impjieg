import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Suspense } from "react";
import JobCard from "@/components/jobs/job-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
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
  MessageSquare,
  RefreshCw,
  Search,
  MapPin,
} from "lucide-react";
import type { JobWithEmployer } from "@/lib/supabase/types";
import { SectorCards } from "@/components/home/sector-cards";

export const dynamic = "force-dynamic";

async function StatsSection() {
  let activeJobs = 0;
  try {
    const supabase = await createClient();
    const { data: jobs } = await supabase
      .from("jobs")
      .select("status, salary_min, salary_max, expires_at")
      .eq("status", "active")
      .gte("expires_at", new Date().toISOString());
    activeJobs = deriveEmployerComplianceSummary((jobs || []) as Array<{
      status: "active";
      salary_min: number | null;
      salary_max: number | null;
    }>).activeJobs;
  } catch {
    activeJobs = 0;
  }

  const stats = [
    { value: activeJobs > 0 ? `${activeJobs} active roles` : "Live Malta roles", note: "Updated daily", Icon: Building2 },
    { value: "Salary visibility", note: "Clearer pay signals", Icon: Banknote },
    { value: "30-day freshness", note: "Expired roles drop off", Icon: Clock },
    { value: "Direct apply", note: "No middlemen", Icon: CheckCircle2 },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
      {stats.map((s) => (
        <div key={s.value} className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2.5 sm:flex-col sm:items-start sm:gap-1.5 sm:px-4 sm:py-4">
          <s.Icon className="h-4 w-4 shrink-0 text-primary sm:h-3.5 sm:w-3.5" />
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-snug text-foreground sm:text-[0.8rem]">{s.value}</p>
            <p className="text-[0.65rem] leading-tight text-muted-foreground sm:text-[0.65rem]">{s.note}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

async function LatestJobs() {
  let jobs: JobWithEmployer[] | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("jobs")
      .select("*, employers(id, name, slug, logo_url, location)")
      .eq("status", "active")
      .gte("expires_at", new Date().toISOString())
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(12);
    jobs = data as unknown as JobWithEmployer[] | null;
  } catch {
    jobs = null;
  }

  if (!jobs || jobs.length === 0) {
    return null;
  }

  const typedJobs = jobs;
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
      <section className="relative overflow-hidden border-b border-border/60 py-20 sm:py-28">
        <div className="sunlight-glow pointer-events-none absolute inset-x-0 top-0 -z-10 h-[460px]" aria-hidden="true" />
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <div className="animate-fade-in-up">
            <h1 className="mx-auto max-w-[15ch] text-5xl font-extrabold tracking-[-0.035em] text-foreground sm:text-6xl lg:text-[4.25rem] lg:leading-[1.05]">
              Find your next opportunity in Malta.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
              Real salaries, clear work-mode, verified employers — Malta&apos;s tech, iGaming, finance and digital jobs, without the noise.
            </p>

            <form
              action="/jobs"
              method="GET"
              role="search"
              className="mx-auto mt-9 flex max-w-2xl flex-col gap-2 rounded-2xl border border-border bg-card p-2 shadow-[0_1px_2px_rgba(11,27,46,0.04),0_18px_44px_-18px_rgba(11,27,46,0.20)] sm:flex-row sm:items-center sm:rounded-full"
            >
              <div className="flex flex-1 items-center gap-2.5 px-4 py-2.5">
                <Search className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <input
                  name="q"
                  type="text"
                  placeholder="Job title or keyword"
                  aria-label="Job title or keyword"
                  className="w-full bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
              <div className="hidden h-7 w-px bg-border sm:block" aria-hidden="true" />
              <div className="flex flex-1 items-center gap-2.5 px-4 py-2.5">
                <MapPin className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <input
                  name="location"
                  type="text"
                  placeholder="Location in Malta"
                  aria-label="Location"
                  className="w-full bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
              <Button type="submit" variant="primary" size="lg" className="gap-2 sm:rounded-full">
                <Search className="h-4 w-4" aria-hidden="true" />
                Search
              </Button>
            </form>

            <div className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
              <span className="text-muted-foreground/80">Popular:</span>
              {[
                ["iGaming", "/jobs/sector/igaming"],
                ["Technology", "/jobs/sector/technology"],
                ["Finance", "/jobs/sector/finance-banking"],
                ["Remote", "/jobs?workType=Remote"],
              ].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className="rounded-full border border-border bg-card px-3 py-1 font-medium text-foreground transition-colors hover:border-primary/30 hover:text-primary"
                >
                  {label}
                </Link>
              ))}
            </div>

            <div className="mx-auto mt-12 max-w-3xl">
              <Suspense fallback={<Skeleton className="h-16 w-full" />}>
                <StatsSection />
              </Suspense>
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

      {/* Trust signals */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Built around clarity, speed, and trust</h2>
            <p className="text-sm text-muted-foreground mt-1">Every role on Impjieg carries signals that help you decide faster</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { icon: Banknote, label: "Salary visibility", desc: "Ranges shown up front" },
              { icon: Building2, label: "Work-mode clarity", desc: "Remote, hybrid, or on-site" },
              { icon: Shield, label: "Employer verification", desc: "Verified badge on trusted profiles" },
              { icon: Clock, label: "Fresh role signals", desc: "30-day expiry, live timestamps" },
              { icon: CheckCircle2, label: "Direct apply", desc: "No agency middlemen" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-2xl border border-border bg-card p-5 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-foreground">{item.label}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
                </div>
              );
            })}
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
                <Button asChild variant="primary" size="lg" className="w-full sm:w-auto">
                  <Link href="/employer/post-job">
                    Start Hiring
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                  <Link href="/pricing">
                    View Pricing
                  </Link>
                </Button>
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
          <SectorCards />
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
            <p className="text-sm text-muted-foreground mt-1">Malta&apos;s hiring marketplace for salary, work-mode, and employer clarity</p>
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

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Card className="marketplace-panel p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 mx-auto">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">Verified employers</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Companies complete profile verification and post at least one live role.
                Verified employers get a trust badge on their profile and job cards.
              </p>
              <Link href="/employer/settings" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80">
                Get verified <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Card>
            <Card className="marketplace-panel p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mx-auto">
                <RefreshCw className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">30-day freshness</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Every job auto-expires after 30 days. Expired roles are removed from search, so you only see active opportunities.
              </p>
              <Link href="/jobs" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80">
                Browse fresh roles <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Card>
            <Card className="marketplace-panel p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10 mx-auto">
                <TrendingUp className="h-6 w-6 text-warning" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">Boosted placement</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Featured roles appear at the top of search and get priority in candidate alerts.
                Add when posting or upgrade anytime from your dashboard.
              </p>
              <Link href="/pricing" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80">
                See pricing <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Common questions</h2>
            <p className="text-sm text-muted-foreground mt-1">Everything you need to know about Impjieg</p>
          </div>
          <dl className="space-y-4">
            {[
              {
                q: "Is it free to post a job?",
                a: "Yes — your first listing is free. No credit card required. After that, standard listings are €29 for 30 days, and featured listings (3× visibility) are €59. Volume discounts and subscription plans are available for teams hiring regularly.",
              },
              {
                q: "How does employer verification work?",
                a: "Companies verify by completing their profile (website, logo, description, industry, location) and posting at least one live role. Verified employers get a trust badge on their profile and job cards, which signals legitimacy to candidates and improves application rates.",
              },
              {
                q: "What does 'freshness window' mean?",
                a: "Every job expires automatically after 30 days. Expired roles are removed from search results, so candidates only see active opportunities. Each listing shows exactly when it was posted (e.g., 'Posted 3 days ago').",
              },
              {
                q: "How do candidates apply?",
                a: "Candidates apply directly through Impjieg — their profile and CV are sent straight to the employer's dashboard. No external redirects, no agency middlemen. Employers get instant notification and can respond within the platform.",
              },
              {
                q: "Can I boost an existing listing?",
                a: "Yes. From your employer dashboard, click 'Boost' on any active standard listing to upgrade it to featured. The boost takes effect immediately and lasts for the remaining duration of your 30-day listing.",
              },
              {
                q: "What sectors and locations are covered?",
                a: "Impjieg focuses on tech, digital, iGaming, finance, legal, marketing, and related professional sectors in Malta. Remote and hybrid roles open to Malta-based candidates are also welcome.",
              },
            ].map((faq, idx) => (
              <div key={idx} className="group rounded-xl border border-border/50 bg-background/50 p-5 hover:border-primary/30 transition-colors">
                <dt className="flex items-center justify-between gap-4 font-medium text-foreground">
                  {faq.q}
                  <MessageSquare className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </dt>
                <dd className="mt-3 text-sm text-muted-foreground leading-relaxed">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA - Single focused action for employers */}
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
            <Button asChild variant="primary" size="lg">
              <Link href="/employer/post-job">
                Start Hiring Free
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            First listing free · No card required · 30-day listing
          </p>
        </div>
      </section>
    </div>
  );
}
