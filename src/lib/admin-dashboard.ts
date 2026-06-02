import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getSupabaseServiceKey, getSupabaseUrl } from "@/lib/supabase/env";
import type { Database, Employer, Job, Application } from "@/lib/supabase/types";
import { formatDate, formatSalary } from "@/lib/utils";

type LatestJob = Job & { employers: Pick<Employer, "name" | "slug"> | null };
type LatestApplication = Application & {
  jobs: Pick<Job, "title" | "slug" | "status"> | null;
  employers: Pick<Employer, "name" | "slug"> | null;
};

type LatestEmployer = Employer;

type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];
type JobAlertRow = Database["public"]["Tables"]["job_alerts"]["Row"];
type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];

function createAdminServiceClient() {
  return createServiceClient<Database>(
    getSupabaseUrl(),
    getSupabaseServiceKey()
  );
}

function sumAmount(rows: PaymentRow[]) {
  return rows.reduce((total, row) => total + row.amount, 0);
}

function countStatus<T extends { status: string }>(rows: T[], status: string) {
  return rows.filter((row) => row.status === status).length;
}

export async function getAdminDashboardData() {
  const supabase = createAdminServiceClient();

  const [
    jobsCount,
    activeJobsCount,
    featuredJobsCount,
    employersCount,
    verifiedEmployersCount,
    applicationsCount,
    alertsCount,
    activeAlertsCount,
    subscriptionsCount,
    activeSubscriptionsCount,
    paymentsCount,
    pendingPaymentsCount,
    recentJobsResult,
    recentApplicationsResult,
    recentEmployersResult,
    recentAlertsResult,
    recentSubscriptionsResult,
    allPaymentsResult,
  ] = await Promise.all([
    supabase.from("jobs").select("id", { count: "exact", head: true }),
    supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("is_featured", true),
    supabase.from("employers").select("id", { count: "exact", head: true }),
    supabase
      .from("employers")
      .select("id", { count: "exact", head: true })
      .eq("is_verified", true),
    supabase
      .from("applications")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("job_alerts")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("job_alerts")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase.from("payments").select("id", { count: "exact", head: true }),
    supabase
      .from("payments")
      .select("id", { count: "exact", head: true })
      .neq("status", "succeeded"),
    supabase
      .from("jobs")
      .select("*, employers(name, slug)")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("applications")
      .select("*, jobs(title, slug, status), employers(name, slug)")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("employers")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("job_alerts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("subscriptions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("payments")
      .select("amount,status,listing_type,created_at")
      .order("created_at", { ascending: false }),
  ]);

  const recentJobs = (recentJobsResult.data || []) as LatestJob[];
  const recentApplications = (recentApplicationsResult.data || []) as LatestApplication[];
  const recentEmployers = (recentEmployersResult.data || []) as LatestEmployer[];
  const allPayments = (allPaymentsResult.data || []) as PaymentRow[];
  const recentPayments = allPayments.slice(0, 8);
  const recentAlerts = (recentAlertsResult.data || []) as JobAlertRow[];
  const recentSubscriptions = (recentSubscriptionsResult.data || []) as SubscriptionRow[];

  const totalRevenue = sumAmount(allPayments);

  const paidRevenue = sumAmount(
    allPayments.filter(
      (payment) => payment.status === "succeeded" || payment.status === "paid"
    )
  );

  const stats = [
    {
      label: "Total Jobs",
      value: jobsCount.count ?? 0,
      note: `${activeJobsCount.count ?? 0} active · ${featuredJobsCount.count ?? 0} featured`,
    },
    {
      label: "Employers",
      value: employersCount.count ?? 0,
      note: `${verifiedEmployersCount.count ?? 0} verified`,
    },
    {
      label: "Applications",
      value: applicationsCount.count ?? 0,
      note: `${countStatus(recentApplications, "applied")} new in the latest page`,
    },
    {
      label: "Job Alerts",
      value: alertsCount.count ?? 0,
      note: `${activeAlertsCount.count ?? 0} active alerts`,
    },
    {
      label: "Subscriptions",
      value: subscriptionsCount.count ?? 0,
      note: `${activeSubscriptionsCount.count ?? 0} active plans`,
    },
    {
      label: "Revenue",
      value: formatSalary(totalRevenue),
      note: `${formatSalary(paidRevenue)} from recent paid activity`,
    },
  ] as const;

  const alertStats = {
    total: alertsCount.count ?? 0,
    active: activeAlertsCount.count ?? 0,
  };

  return {
    stats,
    recentJobs,
    recentApplications,
    recentEmployers,
    recentPayments,
    recentAlerts,
    recentSubscriptions,
    alertStats,
    summary: {
      jobs: jobsCount.count ?? 0,
      activeJobs: activeJobsCount.count ?? 0,
      featuredJobs: featuredJobsCount.count ?? 0,
      employers: employersCount.count ?? 0,
      verifiedEmployers: verifiedEmployersCount.count ?? 0,
      applications: applicationsCount.count ?? 0,
      alerts: alertsCount.count ?? 0,
      activeAlerts: activeAlertsCount.count ?? 0,
      subscriptions: subscriptionsCount.count ?? 0,
      activeSubscriptions: activeSubscriptionsCount.count ?? 0,
      payments: paymentsCount.count ?? 0,
      pendingPayments: pendingPaymentsCount.count ?? 0,
      totalRevenue,
      paidRevenue,
    },
    serviceStatus: [
      {
        label: "Production URL",
        value: process.env.NEXT_PUBLIC_URL || "not configured",
        ok: Boolean(process.env.NEXT_PUBLIC_URL),
      },
      {
        label: "Admin token",
        value: process.env.INTERNAL_ADMIN_TOKEN ? "configured" : "missing",
        ok: Boolean(process.env.INTERNAL_ADMIN_TOKEN),
      },
      {
        label: "Supabase",
        value: getSupabaseUrl(),
        ok: true,
      },
      {
        label: "Stripe keys",
        value:
          process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET
            ? "configured"
            : "missing",
        ok: Boolean(
          process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET
        ),
      },
    ],
    formattedAt: formatDate(new Date()),
  };
}
