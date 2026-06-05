import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ExternalLink, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  adminConsoleNavItems,
  getAdminConsoleSectionMeta,
  type AdminConsoleSection,
  type AdminConsoleData,
  formatAuditEntryValue,
} from "@/lib/admin-consoles";
import { daysAgo, formatDate, formatSalary } from "@/lib/utils";
import { GrantsList } from "./grants/grants-list";
import { CreateGrantForm } from "./grants/create-grant-form";
import type {
  AdminCommercialGrantEmployerOption,
  AdminCommercialGrantRow,
} from "@/lib/monetization/admin-grants/types";

type SummaryMetric = {
  label: string;
  value: string | number;
  note: string;
};

function SectionHeader({
  eyebrow,
  title,
  description,
  summary,
}: {
  eyebrow: string;
  title: string;
  description: string;
  summary: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="default">
          <Shield className="mr-1.5 h-3.5 w-3.5" />
          {eyebrow}
        </Badge>
        <Badge variant="secondary">Live data</Badge>
      </div>
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
          Operations section
        </p>
        <h2 className="text-2xl font-semibold tracking-[-0.04em] text-foreground sm:text-3xl">
          {title}
        </h2>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
          {description}
        </p>
        <p className="text-sm text-muted-foreground">{summary}</p>
      </div>
    </div>
  );
}

function SummaryGrid({ metrics }: { metrics: SummaryMetric[] }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.label} className="overflow-hidden border-border/70 bg-surface p-5 shadow-sm">
          <div className="h-1 w-full rounded-full bg-[linear-gradient(90deg,#1E63FF_0%,#14C7B7_100%)]" />
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {metric.label}
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            {metric.value}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">{metric.note}</p>
        </Card>
      ))}
    </section>
  );
}

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card className="overflow-hidden border-border/70 bg-surface p-0 shadow-sm">
      <div className="h-1 w-full bg-[linear-gradient(90deg,rgba(30,99,255,0.95)_0%,rgba(20,199,183,0.95)_100%)]" />
      <div className="p-6">
        <div className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Console panel
          </p>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="mt-5 space-y-3">{children}</div>
      </div>
    </Card>
  );
}

function listBadgeVariant(status?: string | null) {
  if (!status) return "secondary";
  const normalized = status.toLowerCase();
  if (["active", "succeeded", "paid", "verified", "shortlisted", "interview", "completed", "trialing"].includes(normalized)) {
    return "success";
  }
  if (["pending", "draft", "past_due"].includes(normalized)) {
    return "warning";
  }
  if (["failed", "rejected", "canceled", "suspended"].includes(normalized)) {
    return "error";
  }

  return "secondary";
}

function SectionItem({
  title,
  subtitle,
  meta,
  badge,
  actions,
}: {
  title: string;
  subtitle: string;
  meta?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[1.25rem] border border-border/70 bg-muted/15 p-4 shadow-[0_8px_24px_rgba(11,18,32,0.04)] sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-foreground">{title}</p>
          {badge}
        </div>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
        {meta ? <p className="text-xs text-muted-foreground">{meta}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

function ConsoleAction({
  href,
  label,
  variant = "outline",
  external,
}: {
  href: string;
  label: string;
  variant?: "outline" | "ghost" | "primary";
  external?: boolean;
}) {
  const buttonVariant: "outline" | "ghost" | "primary" =
    variant === "primary" ? "primary" : variant;

  return (
    <Link href={href} target={external ? "_blank" : undefined}>
      <Button variant={buttonVariant} size="sm" className="shadow-none">
        {label}
        {external ? <ExternalLink className="ml-1 h-3.5 w-3.5" /> : <ArrowRight className="ml-1 h-3.5 w-3.5" />}
      </Button>
    </Link>
  );
}

function JobsConsole({ data }: { data: AdminConsoleData }) {
  const { summary, recentJobs } = data;

  return (
    <div className="space-y-6">
      <SummaryGrid
        metrics={[
          { label: "Jobs", value: summary.jobs, note: `${summary.activeJobs} active · ${summary.featuredJobs} featured` },
          { label: "Applications", value: summary.applications, note: "Live application volume" },
          { label: "Views", value: recentJobs.reduce((total, job) => total + job.views, 0), note: "Across the latest listings" },
          { label: "Avg. applications", value: recentJobs.length ? Math.round(recentJobs.reduce((total, job) => total + job.applications_count, 0) / recentJobs.length) : 0, note: "Across the latest listings" },
        ]}
      />

      <Panel title="Recent jobs" description="Current listing state and live actions">
        {recentJobs.map((job) => (
          <SectionItem
            key={job.id}
            title={job.title}
            subtitle={`${job.employers?.name ?? "Unknown employer"} · ${job.location}`}
            meta={`Posted ${daysAgo(job.created_at)} · ${job.status} · ${job.applications_count} applications`}
            badge={<Badge variant={listBadgeVariant(job.status)}>{job.status}</Badge>}
            actions={
              <>
                {job.employers?.slug ? (
                  <ConsoleAction
                    href={`/jobs/${job.employers.slug}/${job.slug}`}
                    label="Public listing"
                    external
                  />
                ) : null}
                <ConsoleAction href={`/employer/jobs/${job.id}/analytics`} label="Analytics" />
              </>
            }
          />
        ))}
      </Panel>
    </div>
  );
}

function EmployersConsole({ data }: { data: AdminConsoleData }) {
  const { summary, recentEmployers } = data;

  return (
    <div className="space-y-6">
      <SummaryGrid
        metrics={[
          { label: "Employers", value: summary.employers, note: `${summary.verifiedEmployers} verified` },
          { label: "Active subscriptions", value: summary.activeSubscriptions, note: `${summary.subscriptions} total plans` },
          { label: "Payments", value: summary.payments, note: `${summary.pendingPayments} pending` },
          { label: "Revenue", value: formatSalary(summary.totalRevenue), note: `${formatSalary(summary.paidRevenue)} paid` },
        ]}
      />

      <Panel title="Recent employers" description="Company accounts and trust signals">
        {recentEmployers.map((employer) => (
          <SectionItem
            key={employer.id}
            title={employer.name}
            subtitle={`${employer.industry ?? "Industry not set"} · ${employer.location ?? "Location not set"}`}
            meta={`Verified ${employer.is_verified ? "yes" : "no"} · Joined ${daysAgo(employer.created_at)}`}
            badge={<Badge variant={employer.is_verified ? "success" : "warning"}>{employer.is_verified ? "Verified" : "Pending"}</Badge>}
            actions={
              <>
                <ConsoleAction href={`/companies/${employer.slug}`} label="Public profile" external />
                {employer.website ? (
                  <ConsoleAction href={employer.website} label="Website" external />
                ) : null}
              </>
            }
          />
        ))}
      </Panel>
    </div>
  );
}

function CandidatesConsole({ data }: { data: AdminConsoleData }) {
  const openToWork = data.candidateProfiles.filter((profile) => profile.is_open_to_work).length;

  return (
    <div className="space-y-6">
      <SummaryGrid
        metrics={[
          { label: "Profiles", value: data.candidateProfiles.length, note: `${openToWork} open to work` },
          { label: "Applications", value: data.candidateApplications.length, note: "Recent candidate activity" },
          { label: "Alerts", value: data.candidateAlerts.length, note: `${data.candidateAlerts.filter((alert) => alert.is_active).length} active` },
          { label: "Skills listed", value: data.candidateProfiles.reduce((total, profile) => total + profile.skills.length, 0), note: "Across visible profiles" },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Candidate profiles" description="Latest profiles and search preferences">
          {data.candidateProfiles.map((profile) => (
            <SectionItem
              key={profile.id}
              title={profile.full_name ?? "Unnamed candidate"}
              subtitle={`${profile.headline ?? "No headline"} · ${profile.location ?? "Location not set"}`}
              meta={`${profile.skills.slice(0, 3).join(" · ") || "No skills listed"} · ${profile.remote_preference ?? "No remote preference"}`}
              badge={<Badge variant={profile.is_open_to_work ? "success" : "secondary"}>{profile.is_open_to_work ? "Open to work" : "Passive"}</Badge>}
            />
          ))}
        </Panel>

        <Panel title="Candidate alerts" description="Saved search and notification preferences">
          {data.candidateAlerts.map((alert) => (
            <SectionItem
              key={alert.id}
              title={alert.name ?? "Unnamed alert"}
              subtitle={`${alert.sectors.join(" · ")} · ${alert.locations.join(" · ")}`}
              meta={`${alert.frequency ?? "No frequency"} · ${alert.remote_type ?? "Any remote type"} · ${formatDate(alert.updated_at)}`}
              badge={<Badge variant={alert.is_active ? "success" : "secondary"}>{alert.is_active ? "Active" : "Paused"}</Badge>}
            />
          ))}
        </Panel>
      </div>

      <Panel title="Recent candidate applications" description="Recent candidate-side submissions and their job matches">
        {data.candidateApplications.map((application) => (
          <SectionItem
            key={application.id}
            title={application.jobs?.title ?? "Unknown job"}
            subtitle={`${application.application_id ?? "No application ID"} · ${application.status}`}
            meta={`Applied ${daysAgo(application.applied_at)} · ${application.jobs?.status ?? "unknown"} listing`}
            badge={<Badge variant={listBadgeVariant(application.status)}>{application.status}</Badge>}
            actions={
              application.jobs && application.employers ? (
                <ConsoleAction
                  href={`/jobs/${application.employers.slug}/${application.jobs.slug}`}
                  label="Open job"
                  external
                />
              ) : null
            }
          />
        ))}
      </Panel>
    </div>
  );
}

function ApplicationsConsole({ data }: { data: AdminConsoleData }) {
  const statusCounts = {
    applied: data.recentApplications.filter((application) => application.status === "applied").length,
    reviewed: data.recentApplications.filter((application) => application.status === "viewed").length,
    shortlisted: data.recentApplications.filter((application) => application.status === "shortlisted").length,
    interview: data.recentApplications.filter((application) => application.status === "interview").length,
  };

  return (
    <div className="space-y-6">
      <SummaryGrid
        metrics={[
          { label: "Applications", value: data.summary.applications, note: "Total pipeline volume" },
          { label: "New", value: statusCounts.applied, note: "Applications awaiting first action" },
          { label: "Reviewed", value: statusCounts.reviewed, note: "Already viewed by recruiters" },
          { label: "Shortlisted", value: statusCounts.shortlisted + statusCounts.interview, note: "Active pipeline progress" },
        ]}
      />

      <Panel title="Recent applications" description="Candidate status and live follow-up actions">
        {data.recentApplications.map((application) => (
          <SectionItem
            key={application.id}
            title={application.candidate_name}
            subtitle={`${application.jobs?.title ?? "Unknown job"} · ${application.employers?.name ?? "Unknown employer"}`}
            meta={`${application.candidate_email} · ${daysAgo(application.created_at)}`}
            badge={<Badge variant={listBadgeVariant(application.status)}>{application.status}</Badge>}
            actions={
              <>
                {application.candidate_cv_url ? (
                  <ConsoleAction href={application.candidate_cv_url} label="Open CV" external />
                ) : (
                  <Badge variant="secondary">No CV uploaded</Badge>
                )}
                {application.jobs && application.employers ? (
                  <ConsoleAction
                    href={`/jobs/${application.employers.slug}/${application.jobs.slug}`}
                    label="Open job"
                    external
                  />
                ) : null}
              </>
            }
          />
        ))}
      </Panel>
    </div>
  );
}

function PaymentsConsole({ data }: { data: AdminConsoleData }) {
  const paymentTotal = data.recentPayments.reduce((total, payment) => total + payment.amount, 0);
  const paidPayments = data.recentPayments.filter((payment) => payment.status === "succeeded" || payment.status === "paid").length;

  return (
    <div className="space-y-6">
      <SummaryGrid
        metrics={[
          { label: "Payments", value: data.summary.payments, note: `${paidPayments} paid in recent activity` },
          { label: "Revenue", value: formatSalary(paymentTotal), note: "Recent payment total" },
          { label: "Pending", value: data.summary.pendingPayments, note: "Awaiting verification" },
          { label: "Paid revenue", value: formatSalary(data.summary.paidRevenue), note: "Verified billing activity" },
        ]}
      />

      <Panel title="Recent payments" description="Latest billing activity by listing type">
        {data.recentPayments.map((payment) => (
          <SectionItem
            key={payment.id}
            title={payment.listing_type}
            subtitle={payment.status}
            meta={`${formatSalary(payment.amount)} · ${formatDate(payment.created_at)}`}
            badge={<Badge variant={listBadgeVariant(payment.status)}>{payment.status}</Badge>}
          />
        ))}
      </Panel>
    </div>
  );
}

function AlertsConsole({ data }: { data: AdminConsoleData }) {
  const activeAlerts = data.recentAlerts.filter((alert) => alert.is_active).length;
  const emailAlerts = data.recentAlerts.filter((alert) => alert.notification_method === "email").length;

  return (
    <div className="space-y-6">
      <SummaryGrid
        metrics={[
          { label: "Alerts", value: data.summary.alerts, note: `${data.summary.activeAlerts} active` },
          { label: "Email alerts", value: emailAlerts, note: "Email notifications" },
          { label: "WhatsApp alerts", value: data.recentAlerts.filter((alert) => alert.notification_method === "whatsapp").length, note: "WhatsApp notifications" },
          { label: "Active ratio", value: data.recentAlerts.length ? `${Math.round((activeAlerts / data.recentAlerts.length) * 100)}%` : "0%", note: "Recent active alerts" },
        ]}
      />

      <Panel title="Recent alerts" description="Saved searches and notification methods">
        {data.recentAlerts.map((alert) => (
          <SectionItem
            key={alert.id}
            title={alert.email}
            subtitle={alert.sectors.join(" · ")}
            meta={`${alert.notification_method} · ${formatDate(alert.created_at)}`}
            badge={<Badge variant={alert.is_active ? "success" : "secondary"}>{alert.is_active ? "Active" : "Paused"}</Badge>}
          />
        ))}
      </Panel>
    </div>
  );
}

function SubscriptionsConsole({ data }: { data: AdminConsoleData }) {
  const trialing = data.recentSubscriptions.filter((subscription) => subscription.status === "trialing").length;

  return (
    <div className="space-y-6">
      <SummaryGrid
        metrics={[
          { label: "Subscriptions", value: data.summary.subscriptions, note: `${data.summary.activeSubscriptions} active` },
          { label: "Trialing", value: trialing, note: "Currently in trial" },
          { label: "Job credits used", value: data.recentSubscriptions.reduce((total, subscription) => total + subscription.job_credits_used, 0), note: "Across recent plans" },
          { label: "Credits active", value: data.summary.activeSubscriptions ? "Yes" : "No", note: "Live plan states" },
        ]}
      />

      <Panel title="Subscription snapshot" description="Recent plan activity and status">
        {data.recentSubscriptions.map((subscription) => (
          <SectionItem
            key={subscription.id}
            title={`${subscription.plan_type} · ${subscription.billing_cycle}`}
            subtitle={`Jobs used ${subscription.job_credits_used}`}
            meta={`Updated ${daysAgo(subscription.updated_at)} · Created ${daysAgo(subscription.created_at)}`}
            badge={<Badge variant={listBadgeVariant(subscription.status)}>{subscription.status}</Badge>}
          />
        ))}
      </Panel>
    </div>
  );
}

function AuditLogConsole({ data }: { data: AdminConsoleData }) {
  const logins = data.auditLogs.filter((log) => log.action === "admin_login").length;

  return (
    <div className="space-y-6">
      <SummaryGrid
        metrics={[
          { label: "Audit entries", value: data.auditLogs.length, note: "Latest recorded admin activity" },
          { label: "Admin logins", value: logins, note: "Recent access events" },
          { label: "Latest action", value: data.auditLogs[0]?.action ?? "None", note: "Most recent recorded event" },
          { label: "Latest entry", value: data.auditLogs[0] ? daysAgo(data.auditLogs[0].created_at) : "None", note: "When the log was last updated" },
        ]}
      />

      <Panel title="Admin audit log" description="Recorded admin actions and security-sensitive events">
        {data.auditLogs.map((entry) => (
          <SectionItem
            key={entry.id}
            title={`${entry.action} · ${entry.entity_type}`}
            subtitle={entry.admin_email}
            meta={`${entry.entity_id} · ${daysAgo(entry.created_at)} · ${formatAuditEntryValue(entry.before_value, entry.after_value)}`}
            badge={<Badge variant="info">Logged</Badge>}
          />
        ))}
      </Panel>
    </div>
  );
}

function CommercialGrantsConsole({
  grants,
  loadError,
  employers,
}: {
  grants: AdminCommercialGrantRow[];
  loadError?: string | null;
  employers: AdminCommercialGrantEmployerOption[];
}) {
  const activeGrants = grants.filter((g) => g.status === "active").length;

  return (
    <div className="space-y-6">
      {loadError ? (
        <Card className="border-amber-300 bg-amber-50 p-5 text-amber-950 shadow-sm">
          <p className="text-sm font-semibold">Commercial grants table is unavailable</p>
          <p className="mt-1 text-sm leading-6">
            The live grants table could not be loaded. Grants will appear here once the data source is restored.
          </p>
          <p className="mt-2 text-xs leading-5 text-amber-900/80">{loadError}</p>
        </Card>
      ) : null}

      <SummaryGrid
        metrics={[
          { label: "Total grants", value: grants.length, note: "Recorded commercial grants" },
          { label: "Active grants", value: activeGrants, note: "Currently providing entitlements" },
          { label: "Revoked", value: grants.filter((g) => g.status === "revoked").length, note: "Manually stopped" },
          { label: "Expired", value: grants.filter((g) => g.status === "expired").length, note: "Naturally concluded" },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_460px] xl:items-start">
        <div className="space-y-6">
          <Panel title="Commercial grants" description="Live grants, usage, and revocation actions.">
            <GrantsList grants={grants} />
          </Panel>
        </div>

        <div className="space-y-6">
          <CreateGrantForm employers={employers} />
        </div>
      </div>
    </div>
  );
}

export function AdminConsoleSectionView({
  section,
  data,
  extra,
}: {
  section: AdminConsoleSection;
  data: AdminConsoleData;
  extra?: {
    grants?: AdminCommercialGrantRow[];
    grantsLoadError?: string | null;
    employers?: AdminCommercialGrantEmployerOption[];
  };
}) {
  const meta = getAdminConsoleSectionMeta(section);
  const overviewLinks = adminConsoleNavItems.filter((item) => item.href !== "/admin/dashboard");

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow={meta.eyebrow}
        title={meta.title}
        description={meta.description}
        summary="Use the live overview to jump between admin consoles without leaving the protected admin shell."
      />

      <div className="rounded-[1.25rem] border border-border/70 bg-surface p-3 shadow-sm">
        <div className="flex flex-wrap gap-2">
        {overviewLinks.map((item) => (
          <ConsoleAction key={item.href} href={item.href} label={item.label} />
        ))}
        </div>
      </div>

      {section === "jobs" ? <JobsConsole data={data} /> : null}
      {section === "employers" ? <EmployersConsole data={data} /> : null}
      {section === "candidates" ? <CandidatesConsole data={data} /> : null}
      {section === "applications" ? <ApplicationsConsole data={data} /> : null}
      {section === "payments" ? <PaymentsConsole data={data} /> : null}
      {section === "alerts" ? <AlertsConsole data={data} /> : null}
      {section === "subscriptions" ? <SubscriptionsConsole data={data} /> : null}
      {section === "commercial-grants" ? (
        <CommercialGrantsConsole
          grants={extra?.grants ?? []}
          loadError={extra?.grantsLoadError ?? null}
          employers={extra?.employers ?? []}
        />
      ) : null}
      {section === "audit-log" ? <AuditLogConsole data={data} /> : null}
    </div>
  );
}
