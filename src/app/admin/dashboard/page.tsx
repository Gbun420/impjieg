import Link from "next/link";
import { redirect } from "next/navigation";
import type { ComponentType } from "react";
import { ExternalLink, LogOut, Briefcase, Building2, FileText, Bell, CreditCard, Users, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { adminLogout } from "../actions";
import { getAdminDashboardData } from "@/lib/admin-dashboard";
import { hasValidAdminSession } from "@/lib/admin-session";
import { daysAgo, formatDate, formatSalary } from "@/lib/utils";

const statusColors: Record<string, "default" | "success" | "warning" | "error" | "secondary" | "accent" | "info"> = {
  active: "success",
  draft: "secondary",
  closed: "warning",
  suspended: "error",
  applied: "info",
  viewed: "secondary",
  shortlisted: "accent",
  interview: "warning",
  offered: "success",
  rejected: "error",
  pending: "warning",
  completed: "success",
  failed: "error",
  trialing: "info",
  canceled: "secondary",
  past_due: "warning",
};

function getBadgeVariant(status?: string | null) {
  if (!status) return "secondary";
  return statusColors[status] ?? "secondary";
}

function StatCard({
  label,
  value,
  note,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  note: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{note}</p>
    </Card>
  );
}

export default async function AdminDashboardPage() {
  if (!(await hasValidAdminSession())) {
    redirect("/admin/login");
  }

  const {
    stats,
    recentJobs,
    recentApplications,
    recentEmployers,
    recentPayments,
    recentAlerts,
    recentSubscriptions,
    serviceStatus,
    formattedAt,
    summary,
  } = await getAdminDashboardData();
  const isDemoMode = serviceStatus.some((item) => item.value === "demo mode");

  return (
    <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-border/60 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.14),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.92),rgba(247,244,255,0.84))] p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default">Internal admin</Badge>
              <Badge variant="success">Production data</Badge>
              <span className="text-xs text-muted-foreground">Last refreshed {formattedAt}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Admin console
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Monitor the marketplace, review live operations, and spot issues quickly. This screen is wired to the deployed Supabase project and shows real data from production.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/" target="_blank">
              <Button variant="outline" size="md">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open site
              </Button>
            </Link>
            <form action={adminLogout}>
              <Button variant="ghost" size="md" type="submit">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </div>

      {isDemoMode ? (
        <Card className="border-amber-300 bg-amber-50 p-4 text-amber-950">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">Demo mode active</p>
              <p className="mt-1 text-sm">
                This dashboard is showing demo data because the live admin services are not fully configured in this environment.
              </p>
            </div>
            <Badge variant="warning">Demo data</Badge>
          </div>
        </Card>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat, index) => {
          const icons = [Briefcase, Building2, FileText, Bell, Users, CreditCard] as const;
          const Icon = icons[index] ?? Briefcase;
          return (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              note={stat.note}
              icon={Icon}
            />
          );
        })}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="border-dashed border-border/60 p-5 shadow-sm md:col-span-2 xl:col-span-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">Additional admin consoles are hidden</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Only the live overview is exposed right now. Other consoles stay out of navigation until they are wired to the real data model.
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Latest jobs</h2>
              <p className="text-sm text-muted-foreground">
                New listings and their current status
              </p>
            </div>
            <Link href="/employer/jobs">
              <Button variant="ghost" size="sm">
                View jobs
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {recentJobs.map((job) => (
              <div
                key={job.id}
                className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">{job.title}</p>
                    <Badge variant={getBadgeVariant(job.status)}>{job.status}</Badge>
                    {job.is_featured ? <Badge variant="default">Featured</Badge> : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {job.employers?.name ?? "Unknown employer"} · {job.location}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Posted {daysAgo(job.created_at)} ·{" "}
                    {job.salary_min && job.salary_max
                      ? `${formatSalary(job.salary_min)} - ${formatSalary(job.salary_max)}`
                      : "Salary not set"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span>{job.views} views</span>
                  <span>{job.applications_count} applications</span>
                  <Link href={`/employer/jobs/${job.id}/analytics`}>
                    <Button variant="outline" size="sm">
                      Analytics
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Platform signals</h2>
          <p className="text-sm text-muted-foreground">
            Quick health check for the live system
          </p>

          <div className="mt-5 space-y-3">
            {serviceStatus.map((item) => (
              <div
                key={item.label}
                className="flex items-start justify-between gap-3 rounded-2xl border border-border/60 bg-muted/20 p-4"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground break-all">{item.value}</p>
                </div>
                <Badge variant={item.ok ? "success" : "warning"}>
                  {item.ok ? "OK" : "Check"}
                </Badge>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Alerts</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{summary.alerts}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {summary.activeAlerts} active
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Subscriptions</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{summary.subscriptions}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {summary.activeSubscriptions} active
              </p>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Latest applications</h2>
              <p className="text-sm text-muted-foreground">
                Recent candidates and their current pipeline status
              </p>
            </div>
            <Link href="/employer/applications">
              <Button variant="ghost" size="sm">
                Review pipeline
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {recentApplications.map((application) => (
              <div
                key={application.id}
                className="rounded-2xl border border-border/60 bg-muted/20 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{application.candidate_name}</p>
                      <Badge variant={getBadgeVariant(application.status)}>
                        {application.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {application.jobs?.title ?? "Unknown job"} ·{" "}
                      {application.employers?.name ?? "Unknown employer"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {application.candidate_email} · {daysAgo(application.created_at)}
                    </p>
                  </div>
                  {application.candidate_cv_url ? (
                    <Link href={application.candidate_cv_url} target="_blank">
                      <Button variant="outline" size="sm">
                        Open CV
                      </Button>
                    </Link>
                  ) : (
                    <Badge variant="secondary">No CV uploaded</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Recent employers</h2>
                <p className="text-sm text-muted-foreground">New company accounts and trust signals</p>
              </div>
              <Badge variant="info">{summary.verifiedEmployers} verified</Badge>
            </div>

            <div className="mt-5 space-y-3">
              {recentEmployers.map((employer) => (
                <div
                  key={employer.id}
                  className="rounded-2xl border border-border/60 bg-muted/20 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{employer.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {employer.industry ?? "Industry not set"} ·{" "}
                        {employer.location ?? "Location not set"}
                      </p>
                    </div>
                    <Badge variant={employer.is_verified ? "success" : "warning"}>
                      {employer.is_verified ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Recent payments</h2>
            <p className="text-sm text-muted-foreground">Latest billing activity by listing type</p>

            <div className="mt-5 space-y-3">
              {recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/20 p-4"
                >
                  <div>
                    <p className="font-medium text-foreground">{payment.listing_type}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(payment.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {formatSalary(payment.amount)}
                    </p>
                    <Badge variant={getBadgeVariant(payment.status)}>{payment.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Job alerts</h2>
          <p className="text-sm text-muted-foreground">
            Live subscriber activity for email and WhatsApp alerts
          </p>

          <div className="mt-5 space-y-3">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/20 p-4"
              >
                <div>
                  <p className="font-medium text-foreground">{alert.email}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {alert.notification_method} · {alert.sectors.join(", ")}
                  </p>
                </div>
                <Badge variant={alert.is_active ? "success" : "secondary"}>
                  {alert.is_active ? "Active" : "Paused"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Subscription snapshot</h2>
          <p className="text-sm text-muted-foreground">Recent plan activity and status</p>

          <div className="mt-5 space-y-3">
            {recentSubscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/20 p-4"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {subscription.plan_type} · {subscription.billing_cycle}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Jobs used {subscription.job_credits_used}
                  </p>
                </div>
                <Badge variant={getBadgeVariant(subscription.status)}>{subscription.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
