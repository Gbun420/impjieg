import Link from "next/link";
import { redirect } from "next/navigation";
import type { ComponentType } from "react";
import { Briefcase, Building2, FileText, Bell, CreditCard, Users, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdminDataErrorState } from "@/components/admin/admin-data-error-state";
import {
  adminConsoleSections,
  adminConsoleNavGroups,
  getAdminConsoleSectionMeta,
} from "@/lib/admin-consoles";
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
    <Card className="overflow-hidden border-border/70 bg-surface p-5 shadow-sm">
      <div className="h-1 w-full rounded-full bg-[linear-gradient(90deg,#1E63FF_0%,#14C7B7_100%)]" />
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/60 bg-muted/20 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{note}</p>
    </Card>
  );
}

function QuickActionCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className="group">
      <div className="rounded-2xl border border-border/70 bg-background/70 p-4 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:border-border-hover group-hover:shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
          </div>
          <ArrowRight className="mt-0.5 h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
        </div>
      </div>
    </Link>
  );
}

export default async function AdminDashboardPage() {
  if (!(await hasValidAdminSession())) {
    redirect("/admin/login");
  }

  let dashboardData;
  try {
    dashboardData = await getAdminDashboardData();
  } catch (error) {
    console.error(
      "Admin dashboard data load failed:",
      error instanceof Error ? error.message : String(error)
    );
    return (
      <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <AdminDataErrorState
          title="Admin dashboard data is temporarily unavailable"
          description="The admin shell is working, but one of the live dashboard queries failed while the page was loading. Refresh the page or try again from the dashboard shortcut."
          routeLabel="Admin dashboard"
          retryHref="/admin/dashboard"
        />
      </div>
    );
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
  } = dashboardData;
  const isDemoMode = serviceStatus.some((item) => item.value === "demo mode");
  const consoleShortcutGroups = adminConsoleNavGroups.map((group) => ({
    label: group.label,
    description: group.description,
    items: group.items.filter((item) => item.href !== "/admin/dashboard").map((item) => {
      const section = adminConsoleSections.find((entry) => entry.href === item.href);
      const meta = section ? getAdminConsoleSectionMeta(section.slug) : null;
      return {
        href: item.href,
        title: item.label,
        description: meta?.description ?? "",
      };
    }),
  }));

  return (
    <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[2rem] border border-border/70 bg-[linear-gradient(135deg,#0B1220_0%,#121A2B_55%,#0F172A_100%)] text-white shadow-[0_28px_80px_rgba(11,18,32,0.18)]">
        <div className="relative overflow-hidden px-6 py-7 sm:px-8">
          <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_top_right,rgba(30,99,255,0.24),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(20,199,183,0.16),transparent_28%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="border-white/10 bg-white/10 text-white">
                  Internal admin
                </Badge>
                <Badge variant="secondary" className="border-white/10 bg-white/5 text-white/85">
                  Production data
                </Badge>
                <Badge variant="secondary" className="border-white/10 bg-white/5 text-white/75">
                  Protected route
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.32em] text-white/55">
                  Operations control plane
                </p>
                <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                  Admin console
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-white/72 sm:text-base">
                  Monitor the marketplace, review live operations, and spot issues quickly.
                  This screen is wired to the deployed Supabase project and shows live production data.
                </p>
              </div>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-xl">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/50">Scope</p>
                <p className="mt-2 text-sm font-medium text-white">Live marketplace overview</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/50">Refreshed</p>
                <p className="mt-2 text-sm font-medium text-white">{formattedAt}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/50">Access</p>
                <p className="mt-2 text-sm font-medium text-white">Authenticated only</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/50">Mode</p>
                <p className="mt-2 text-sm font-medium text-white">Production data</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="grid gap-4 xl:grid-cols-4">
        {consoleShortcutGroups.map((group) => (
          <Card key={group.label} className="overflow-hidden border-border/70 bg-surface p-5 shadow-sm">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{group.label}</p>
              <p className="text-sm text-muted-foreground">{group.description}</p>
            </div>
            <div className="mt-4 space-y-3">
              {group.items.map((item) => (
                <QuickActionCard
                  key={item.href}
                  href={item.href}
                  title={item.title}
                  description={item.description}
                />
              ))}
            </div>
          </Card>
        ))}
      </section>

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
              <p className="text-sm font-medium text-foreground">
                Additional admin consoles are wired to live data
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Use the shortcuts above to open jobs, employers, candidates, applications, payments, alerts, subscriptions, and the audit log.
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
            <Link href="/admin/jobs">
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
        <Card className="border-border/70 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Hiring pipeline
              </p>
              <h2 className="mt-1 text-lg font-semibold text-foreground">Latest applications</h2>
              <p className="text-sm text-muted-foreground">
                Recent candidates and their current pipeline status
              </p>
            </div>
            <Link href="/admin/applications">
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
                className="rounded-2xl border border-border/70 bg-muted/15 p-4 shadow-[0_8px_24px_rgba(11,18,32,0.04)]"
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
          <Card className="border-border/70 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Employer accounts
                </p>
                <h2 className="mt-1 text-lg font-semibold text-foreground">Recent employers</h2>
                <p className="text-sm text-muted-foreground">New company accounts and trust signals</p>
              </div>
              <Badge variant="info">{summary.verifiedEmployers} verified</Badge>
            </div>

            <div className="mt-5 space-y-3">
              {recentEmployers.map((employer) => (
                <div
                  key={employer.id}
                className="rounded-2xl border border-border/70 bg-muted/15 p-4 shadow-[0_8px_24px_rgba(11,18,32,0.04)]"
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

          <Card className="border-border/70 p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Billing activity
            </p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">Recent payments</h2>
            <p className="text-sm text-muted-foreground">Latest billing activity by listing type</p>

            <div className="mt-5 space-y-3">
              {recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/15 p-4 shadow-[0_8px_24px_rgba(11,18,32,0.04)]"
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
        <Card className="border-border/70 p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Notification activity</p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">Job alerts</h2>
          <p className="text-sm text-muted-foreground">
            Live subscriber activity for email and WhatsApp alerts
          </p>

          <div className="mt-5 space-y-3">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/15 p-4 shadow-[0_8px_24px_rgba(11,18,32,0.04)]"
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

        <Card className="border-border/70 p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Subscription operations</p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">Subscription snapshot</h2>
          <p className="text-sm text-muted-foreground">Recent plan activity and status</p>

          <div className="mt-5 space-y-3">
            {recentSubscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/15 p-4 shadow-[0_8px_24px_rgba(11,18,32,0.04)]"
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
