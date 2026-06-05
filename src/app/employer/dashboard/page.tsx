import { createClient } from "@/lib/supabase/server";
import { ensureEmployerProfile } from "@/lib/actions/auth";
import { getEmployerEntitlements } from "@/lib/actions/monetization";
import { deriveApplicationInsights } from "@/lib/application-insights";
import { deriveEmployerComplianceSummary } from "@/lib/compliance";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, Eye, Users, Briefcase, TrendingUp, Clock, ArrowRight, Zap } from "lucide-react";
import { daysAgo, daysUntil, formatDate } from "@/lib/utils";
import type { Application, Employer, Job } from "@/lib/supabase/types";

export default async function EmployerDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/employer/dashboard");
  }

  // Ensure employer profile exists (lazy creation)
  const { profile, error: profileError } = await ensureEmployerProfile();

  if (profileError || !profile) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Unable to load your employer profile.</p>
          <Link href="/auth/login" className="mt-4 inline-block">
            <Button variant="outline">Sign In Again</Button>
          </Link>
        </div>
      </div>
    );
  }

  const employer = profile as Employer;
  const entitlements = await getEmployerEntitlements().catch(() => null);

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("employer_id", employer.id)
    .order("created_at", { ascending: false });

  const { data: applications } = await supabase
    .from("applications")
    .select("*, jobs(title)")
    .eq("employer_id", employer.id)
    .order("created_at", { ascending: false });

  const typedJobs = (jobs || []) as Job[];
  const activeJobs = typedJobs.filter((j) => j.status === "active");
  const salaryCoverage = deriveEmployerComplianceSummary(typedJobs);
  const totalViews = typedJobs.reduce((sum, j) => sum + (j.views || 0), 0);
  const totalApplications = typedJobs.reduce((sum, j) => sum + (j.applications_count || 0), 0);
  const avgApplicationRate = totalViews > 0 ? ((totalApplications / totalViews) * 100).toFixed(1) : "0";
  const recentApps = (applications || []) as Array<
    Application & { jobs: { title: string } | null }
  >;
  const appInsights = deriveApplicationInsights(recentApps);

  const topJobs = [...typedJobs]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 3);
  const salaryCoverageLabel =
    salaryCoverage.activeJobs === 0
      ? "No active jobs"
      : salaryCoverage.status === "green"
        ? "On track"
        : salaryCoverage.status === "amber"
          ? "Needs attention"
          : "Missing ranges";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back, {employer.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Here&apos;s an overview of your hiring activity
          </p>
        </div>
        <Link href="/employer/post-job" className="self-start sm:self-auto">
          <Button variant="primary">
            <PlusCircle className="mr-2 h-4 w-4" />
            Post a New Job
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Jobs</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{activeJobs.length}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
              <Briefcase className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Views</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{totalViews}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
              <Eye className="h-5 w-5 text-blue-500" />
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Applications</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{totalApplications}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
              <Users className="h-5 w-5 text-purple-500" />
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Review Backlog</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{appInsights.staleNewApplications}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
              <TrendingUp className="h-5 w-5 text-amber-500" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            New applications older than 72 hours
          </p>
        </Card>
      </div>

      <Card className="overflow-hidden border-border/70 bg-surface shadow-sm">
        <div className="border-b border-border/60 bg-[linear-gradient(135deg,rgba(30,99,255,0.08),rgba(20,199,183,0.04))] p-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Salary coverage
              </p>
              <h2 className="mt-1 text-lg font-semibold text-foreground">
                Active jobs with a complete salary range
              </h2>
            </div>
            <Badge
              variant={
                salaryCoverage.activeJobs === 0
                  ? "secondary"
                  : salaryCoverage.status === "green"
                  ? "success"
                  : salaryCoverage.status === "amber"
                    ? "warning"
                    : "error"
              }
              className="self-start sm:self-auto"
            >
              {salaryCoverageLabel}
            </Badge>
          </div>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Active jobs",
              value: salaryCoverage.activeJobs,
              note: "Jobs currently live",
            },
            {
              label: "With salary range",
              value: salaryCoverage.compliantActiveJobs,
              note: "Live jobs ready to publish",
            },
            {
              label: "Missing salary range",
              value: salaryCoverage.missingSalaryJobs,
              note: "Active jobs still need a range",
            },
            {
              label: "Coverage",
              value: `${salaryCoverage.salaryCoveragePercent}%`,
              note: "Based on active jobs only",
            },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-border/60 bg-background/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{item.value}</p>
              <p className="mt-2 text-xs text-muted-foreground">{item.note}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-border/60 px-5 py-4">
          <p className="text-sm text-muted-foreground">
            {salaryCoverage.activeJobs === 0
              ? "Add your first active job to start tracking salary coverage."
              : "This check is based on live jobs with both salary fields completed. It does not certify legal compliance."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/employer/jobs">
              <Button variant="outline" size="sm">
                Review active jobs
              </Button>
            </Link>
            <Link href="/employer/post-job">
              <Button variant="primary" size="sm">
                Post a new job
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden border-border/70 bg-surface shadow-sm">
          <div className="border-b border-border/60 bg-[linear-gradient(135deg,rgba(30,99,255,0.08),rgba(20,199,183,0.04))] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Commercial entitlements
                </p>
                <h2 className="mt-1 text-lg font-semibold text-foreground">
                  Available credits and discounts
                </h2>
              </div>
              <Badge variant="info">Live</Badge>
            </div>
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Job credits", value: entitlements?.credits.job.remaining ?? 0, note: "Standard posts" },
              { label: "Featured credits", value: entitlements?.credits.featured.remaining ?? 0, note: "Premium visibility" },
              { label: "Boost credits", value: entitlements?.credits.boost.remaining ?? 0, note: "Promotion boosts" },
              { label: "Discounts", value: entitlements?.discounts.length ?? 0, note: "Checkout savings" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{item.value}</p>
                <p className="mt-2 text-xs text-muted-foreground">{item.note}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Next best action
          </p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">
            Keep hiring without reopening checkout
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Use any available credits on your next job, or review pricing if you need more visibility.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Link href="/employer/post-job">
              <Button variant="primary" className="w-full">
                Post a new job
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="w-full">
                Review pricing
              </Button>
            </Link>
          </div>
          {entitlements?.activePlan ? (
            <div className="mt-4 rounded-2xl border border-border/60 bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Active plan
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {entitlements.activePlan.planKey ?? "Commercial plan access"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Expires {entitlements.activePlan.expiresAt ? formatDate(entitlements.activePlan.expiresAt) : "when the grant ends"}
              </p>
            </div>
          ) : null}
        </Card>
      </div>

      <Card className="overflow-hidden border-border/70 bg-[linear-gradient(135deg,rgba(14,23,45,0.98),rgba(23,37,76,0.94)_55%,rgba(12,17,29,0.98))] p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <Badge variant="info" className="border-white/10 bg-white/10 text-white">
              SEO-led growth
            </Badge>
            <h2 className="mt-3 text-2xl font-bold tracking-tight">
              Turn hiring searches into inbound employer leads.
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/76 sm:text-base">
              Use SEO, employer page optimisation, and iGaming content clusters to pull employers into Impjieg before they are ready to post.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:min-w-[220px]">
            <Link href="/employer-growth">
              <Button variant="primary" className="w-full">
                Open growth sprint
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10">
                Review pricing
              </Button>
            </Link>
          </div>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {[
            "Rank employer pages for Malta hiring demand",
            "Capture more inbound employer enquiries",
            "Bundle SEO with paid listing upgrades",
          ].map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm leading-6 text-white/82">{item}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Average first action</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {appInsights.averageFirstActionHours !== null ? `${appInsights.averageFirstActionHours}h` : "N/A"}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
              <Clock className="h-5 w-5 text-cyan-500" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Average time from application to first status change
          </p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Apply Rate</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{avgApplicationRate}%</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Applications divided by job detail views
          </p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Top Performing Jobs</h2>
            <Link href="/employer/jobs">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {topJobs.length === 0 ? (
            <Card className="mt-4 p-8 text-center">
              <p className="text-muted-foreground">No jobs posted yet.</p>
              <Link href="/employer/post-job" className="mt-4 inline-block">
                <Button variant="primary">Post Your First Job</Button>
              </Link>
            </Card>
          ) : (
            <div className="mt-4 space-y-3">
              {topJobs.map((job) => {
                const appRate = job.views > 0 ? ((job.applications_count / job.views) * 100).toFixed(1) : "0";
                const daysLeft = job.expires_at
                  ? daysUntil(job.expires_at)
                  : 0;

                return (
                  <Card key={job.id} className="p-4 transition-all hover:shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        job.is_featured
                          ? "bg-gradient-to-br from-primary/20 to-secondary/20"
                          : "bg-muted/50"
                      }`}>
                        <Briefcase className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground truncate">{job.title}</h3>
                          {job.is_featured && <Badge variant="default" className="text-xs">Featured</Badge>}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                          <span>{job.views} views</span>
                          <span>{job.applications_count} applications</span>
                          <span>{appRate}% apply rate</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {daysLeft > 0 ? `${daysLeft}d left` : "Expired"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent Applications</h2>
            <Link href="/employer/applications">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {recentApps.slice(0, 5).length === 0 ? (
            <Card className="mt-4 p-8 text-center">
              <p className="text-muted-foreground">No applications yet.</p>
            </Card>
          ) : (
            <div className="mt-4 space-y-3">
              {recentApps.slice(0, 5).map((app) => (
                <Card key={app.id} className="p-4 transition-all hover:shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{app.candidate_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{app.jobs?.title}</p>
                    </div>
                    <Badge
                      variant={
                        app.status === "shortlisted"
                          ? "success"
                          : app.status === "rejected"
                            ? "error"
                            : app.status === "reviewed"
                              ? "warning"
                              : "secondary"
                      }
                      className="text-xs"
                    >
                      {app.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{daysAgo(app.created_at)}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {activeJobs.some((j) => !j.is_featured) && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Boost your visibility</h3>
              <p className="text-sm text-muted-foreground">
                Featured jobs get 3x more views and appear at the top of search results.
              </p>
            </div>
            <Link href="/employer/jobs">
              <Button variant="primary" size="sm">
                <Zap className="mr-1.5 h-4 w-4" />
                Upgrade Jobs
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
