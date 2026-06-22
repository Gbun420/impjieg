import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Suspense } from "react";
import JobCard from "@/components/jobs/job-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
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
  Briefcase,
} from "lucide-react";
import type { JobWithEmployer } from "@/lib/supabase/types";
import { SectorCards } from "@/components/home/sector-cards";
import { LatestArticles } from "@/components/home/latest-articles";

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
        <div key={s.value} className="flex items-center gap-2 rounded-2xl border border-black/10 bg-white/85 px-3 py-2.5 backdrop-blur-sm sm:flex-col sm:items-start sm:gap-1.5 sm:px-4 sm:py-4">
          <s.Icon className="h-4 w-4 shrink-0 text-[#141210] sm:h-3.5 sm:w-3.5" />
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-snug text-[#141210] sm:text-[0.8rem]">{s.value}</p>
            <p className="text-[0.65rem] leading-tight text-[#5b4f33] sm:text-[0.65rem]">{s.note}</p>
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
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Latest Jobs</h2>
          <p className="text-sm text-muted-foreground mt-1">Fresh opportunities updated regularly</p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-6 py-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/20">
            <Briefcase className="h-7 w-7 text-[#141210]" aria-hidden="true" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-foreground">New Malta roles are landing soon</h3>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
            Be the first to know — set a free job alert, or read our guides to working in Malta while you wait.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button asChild variant="primary" size="lg"><Link href="/alerts">Set a job alert</Link></Button>
            <Button asChild variant="outline" size="lg"><Link href="/blog">Read the Malta guides</Link></Button>
          </div>
        </div>
      </div>
    );
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

export default function HomePage() {
  return (
    <div>
      {/* Hero — vibrant sunlight yellow */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFD93B] to-[#FFC400] py-20 sm:py-28">
        <div aria-hidden className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-white/25 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-black/[0.06] blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <div className="animate-fade-in-up">
            <h1 className="mx-auto max-w-[16ch] text-5xl font-extrabold leading-[1.02] tracking-[-0.04em] text-[#141210] sm:text-6xl lg:text-7xl">
              Find your next opportunity in Malta.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg font-medium leading-8 text-[#3f3414] sm:text-xl">
              Real salaries, clear work-mode, verified employers — Malta&apos;s tech, iGaming, finance and digital jobs, without the noise.
            </p>

            <form
              action="/jobs"
              method="GET"
              role="search"
              className="mx-auto mt-9 flex max-w-2xl flex-col gap-2 rounded-2xl border border-black/10 bg-white p-2 shadow-[0_22px_50px_-22px_rgba(20,18,16,0.5)] sm:flex-row sm:items-center sm:rounded-full"
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
              <Button
                type="submit"
                size="lg"
                className="gap-2 bg-[#141210] text-white shadow-[0_10px_24px_-10px_rgba(20,18,16,0.6)] hover:bg-black sm:rounded-full"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                Search
              </Button>
            </form>

            <div className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="font-semibold text-[#3f3414]">Popular:</span>
              {[
                ["iGaming", "/jobs/sector/igaming"],
                ["Technology", "/jobs/sector/technology"],
                ["Finance", "/jobs/sector/finance-banking"],
                ["Remote", "/jobs?workType=Remote"],
              ].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className="rounded-full border border-black/15 bg-white/60 px-3 py-1 font-semibold text-[#141210] transition-colors hover:bg-white"
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

      {/* Trust strip — warm-black band, white font + yellow accents */}
      <section className="bg-[#141210] py-7 text-white sm:py-9">
        <Reveal className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4 px-4 text-sm text-white/75 sm:flex-row sm:gap-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#FFC400]" />
            <span>Employer context</span>
          </div>
          <div className="hidden h-4 w-px bg-white/15 sm:block" />
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#FFC400]" />
            <span>Salary transparency</span>
          </div>
          <div className="hidden h-4 w-px bg-white/15 sm:block" />
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#FFC400]" />
            <span>Fresh market signal</span>
          </div>
        </Reveal>
      </section>

      {/* Built around clarity */}
      <section className="py-14 sm:py-20">
        <Reveal className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Built around clarity, speed, and trust</h2>
            <p className="mt-1 text-sm text-muted-foreground">Every role on Impjieg carries signals that help you decide faster</p>
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
                <div key={item.label} className="rounded-2xl border border-border bg-card p-5 text-center transition-transform duration-200 hover:-translate-y-1">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20">
                    <Icon className="h-5 w-5 text-[#141210]" />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-foreground">{item.label}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </Reveal>
      </section>

      {/* For employers — warm-black band, white font + yellow accents */}
      <section className="py-6 sm:py-10">
        <Reveal className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1f1a12] to-[#0c0a08] p-8 shadow-[0_28px_70px_-30px_rgba(12,10,8,0.6)] sm:p-12">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFC400]">For employers</p>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Build a stronger Malta hiring pipeline without agency-level drag.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
                  Publish polished roles, surface salary and work-mode expectations, boost urgent vacancies, and review applicants from one clean employer workspace.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button asChild variant="primary" size="lg" className="w-full sm:w-auto">
                    <Link href="/employer/post-job">Start hiring</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="w-full border-white/25 bg-white/10 text-white hover:bg-white/20 sm:w-auto">
                    <Link href="/pricing">View pricing</Link>
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {[
                  { title: "Paid visibility", copy: "Give urgent roles stronger placement across the marketplace.", icon: TrendingUp },
                  { title: "Screening support", copy: "Add candidate checks when a role needs a tighter shortlist.", icon: Shield },
                  { title: "Hiring analytics", copy: "See what is getting views, clicks, and applications faster.", icon: Users },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <Icon className="h-5 w-5 text-[#FFC400]" />
                      <h3 className="mt-3 text-base font-semibold text-white">{item.title}</h3>
                      <p className="mt-1.5 text-sm leading-6 text-white/65">{item.copy}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Browse by Sector */}
      <section className="py-14 sm:py-20">
        <Reveal className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Browse key sectors</h2>
              <p className="mt-1 text-sm text-muted-foreground">Focus on the industries that move Malta hiring forward</p>
            </div>
            <Link href="/jobs" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              All sectors <ArrowRight className="ml-0.5 inline h-3.5 w-3.5" />
            </Link>
          </div>
          <SectorCards />
        </Reveal>
      </section>

      {/* Latest Jobs */}
      <section className="border-t border-border py-14 sm:py-20">
        <Reveal className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <LatestJobs />
          </Suspense>
        </Reveal>
      </section>

      {/* From the blog */}
      <section className="border-t border-border py-14 sm:py-20">
        <Reveal className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <LatestArticles />
        </Reveal>
      </section>

      {/* Why Impjieg */}
      <section className="border-t border-border bg-muted/40 py-14 sm:py-20">
        <Reveal className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Why Impjieg</h2>
            <p className="mt-1 text-sm text-muted-foreground">Malta&apos;s hiring marketplace for salary, work-mode, and employer clarity</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: Banknote, title: "Salary clarity", copy: "Every listing shows a salary range up front, so candidates can judge fit before they apply." },
              { icon: Clock, title: "Fresh listings", copy: "Jobs expire after 30 days, keeping the marketplace current and useful." },
              { icon: Users, title: "Direct applications", copy: "Apply directly to employers. No middlemen, no hidden steps." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-[1.35rem] border border-border bg-card p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                    <Icon className="h-5 w-5 text-[#141210]" />
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.copy}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Card className="p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">Verified employers</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Companies complete profile verification and post at least one live role.
                Verified employers get a trust badge on their profile and job cards.
              </p>
              <Link href="/employer/settings" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80">
                Get verified <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Card>
            <Card className="p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20">
                <RefreshCw className="h-6 w-6 text-[#141210]" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">30-day freshness</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Every job auto-expires after 30 days. Expired roles are removed from search, so you only see active opportunities.
              </p>
              <Link href="/jobs" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80">
                Browse fresh roles <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Card>
            <Card className="p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20">
                <TrendingUp className="h-6 w-6 text-[#141210]" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">Boosted placement</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Featured roles appear at the top of search and get priority in candidate alerts.
                Add when posting or upgrade anytime from your dashboard.
              </p>
              <Link href="/pricing" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80">
                See pricing <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Card>
          </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="border-t border-border py-14 sm:py-20">
        <Reveal className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Common questions</h2>
            <p className="mt-1 text-sm text-muted-foreground">Everything you need to know about Impjieg</p>
          </div>
          <dl className="space-y-4">
            {[
              {
                q: "Is it free to post a job?",
                a: "Yes — your first listing is free. No credit card required. After that, standard listings are €39 for 30 days, and featured listings (3× visibility) are €69. Volume discounts and subscription plans are available for teams hiring regularly.",
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
              <div key={idx} className="group rounded-xl border border-border/60 bg-card p-5 transition-colors hover:border-accent">
                <dt className="flex items-center justify-between gap-4 font-medium text-foreground">
                  {faq.q}
                  <MessageSquare className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-[#141210]" />
                </dt>
                <dd className="mt-3 text-sm leading-relaxed text-muted-foreground">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      {/* CTA — vibrant yellow bookend */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FFD93B] to-[#FFC400] py-16 sm:py-20">
        <div aria-hidden className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-white/25 blur-3xl" />
        <Reveal className="relative mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#141210]">
            <Building2 className="h-6 w-6 text-[#FFC400]" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#141210] sm:text-4xl">
            Hiring? Post roles that get seen.
          </h2>
          <p className="mx-auto mt-2 max-w-md text-base font-medium text-[#3f3414]">
            Reach Malta&apos;s best-fit candidates with salary clarity, stronger visibility, and a cleaner application flow.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild size="lg" className="bg-[#141210] text-white shadow-[0_10px_24px_-10px_rgba(20,18,16,0.6)] hover:bg-black">
              <Link href="/employer/post-job">Start hiring free</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs font-medium text-[#3f3414]">
            First listing free · No card required · 30-day listing
          </p>
        </Reveal>
      </section>
    </div>
  );
}
