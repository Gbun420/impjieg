export type AdminDashboardSummary = {
  jobs: number;
  activeJobs: number;
  featuredJobs: number;
  employers: number;
  verifiedEmployers: number;
  applications: number;
  alerts: number;
  activeAlerts: number;
  subscriptions: number;
  activeSubscriptions: number;
  payments: number;
  pendingPayments: number;
  totalRevenue: number;
  paidRevenue: number;
};

export type AdminDashboardServiceStatus = {
  label: string;
  value: string;
  ok: boolean;
};

export type AdminDashboardAuditLog = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  admin_email: string;
  created_at: string;
};

export type AdminDashboardPriorityTone = "critical" | "warning" | "info";

export type AdminDashboardPriorityItem = {
  label: string;
  value: string;
  note: string;
  href: string;
  tone: AdminDashboardPriorityTone;
};

type BuildAdminDashboardPriorityItemsInput = {
  summary: AdminDashboardSummary;
  serviceStatus: AdminDashboardServiceStatus[];
  recentAuditLogs: AdminDashboardAuditLog[];
};

function formatServiceCheckNote(serviceStatus: AdminDashboardServiceStatus[]) {
  const failed = serviceStatus.filter((item) => !item.ok).map((item) => item.label);

  if (failed.length === 0) {
    return "All platform checks are green";
  }

  if (failed.length === 1) {
    return `${failed[0]} needs attention`;
  }

  return `${failed.length} checks need attention`;
}

export function buildAdminDashboardPriorityItems({
  summary,
  serviceStatus,
  recentAuditLogs,
}: BuildAdminDashboardPriorityItemsInput): AdminDashboardPriorityItem[] {
  const items: AdminDashboardPriorityItem[] = [];
  const failingChecks = serviceStatus.filter((item) => !item.ok).length;
  const unverifiedEmployers = Math.max(summary.employers - summary.verifiedEmployers, 0);
  const recentActions = recentAuditLogs.length;

  if (serviceStatus.length > 0) {
    items.push({
      label: "Service checks",
      value: failingChecks > 0 ? `${failingChecks} issue${failingChecks === 1 ? "" : "s"}` : "All green",
      note: formatServiceCheckNote(serviceStatus),
      href: "/admin/audit-log",
      tone: failingChecks > 0 ? "critical" : "info",
    });
  }

  if (summary.pendingPayments > 0) {
    items.push({
      label: "Pending payments",
      value: `${summary.pendingPayments} payment${summary.pendingPayments === 1 ? "" : "s"}`,
      note: `${summary.payments} payments tracked overall`,
      href: "/admin/payments",
      tone: "warning",
    });
  }

  if (unverifiedEmployers > 0) {
    items.push({
      label: "Employer verification",
      value: `${unverifiedEmployers} pending`,
      note: `${summary.verifiedEmployers} verified of ${summary.employers} employers`,
      href: "/admin/employers",
      tone: "warning",
    });
  }

  if (recentActions > 0) {
    items.push({
      label: "Recent admin activity",
      value: `${recentActions} logged action${recentActions === 1 ? "" : "s"}`,
      note: `${recentAuditLogs[0]?.action ?? "No action"} was the latest recorded event`,
      href: "/admin/audit-log",
      tone: "info",
    });
  }

  return items;
}
