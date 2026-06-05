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

function getDemoAdminDashboardData() {
  const recentJobs = [
    {
      id: "demo-job-1",
      title: "Senior Product Designer",
      location: "Sliema, Malta",
      status: "active",
      is_featured: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      salary_min: 45000,
      salary_max: 65000,
      views: 184,
      applications_count: 17,
      employers: { name: "Atlas Studio", slug: "atlas-studio" },
    },
    {
      id: "demo-job-2",
      title: "Full Stack Engineer",
      location: "Remote",
      status: "draft",
      is_featured: false,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 46).toISOString(),
      salary_min: 38000,
      salary_max: 54000,
      views: 92,
      applications_count: 8,
      employers: { name: "Harbor Tech", slug: "harbor-tech" },
    },
    {
      id: "demo-job-3",
      title: "Operations Manager",
      location: "Valletta",
      status: "active",
      is_featured: false,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      salary_min: 32000,
      salary_max: 42000,
      views: 121,
      applications_count: 11,
      employers: { name: "Northline Group", slug: "northline-group" },
    },
  ] as LatestJob[];

  const recentApplications = [
    {
      id: "demo-app-1",
      candidate_name: "Mia Borg",
      candidate_email: "mia@example.com",
      candidate_cv_url: "https://example.com/cv.pdf",
      status: "shortlisted",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      jobs: { title: "Senior Product Designer", slug: "senior-product-designer", status: "active" },
      employers: { name: "Atlas Studio", slug: "atlas-studio" },
    },
    {
      id: "demo-app-2",
      candidate_name: "Liam Grech",
      candidate_email: "liam@example.com",
      candidate_cv_url: null,
      status: "applied",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
      jobs: { title: "Full Stack Engineer", slug: "full-stack-engineer", status: "draft" },
      employers: { name: "Harbor Tech", slug: "harbor-tech" },
    },
    {
      id: "demo-app-3",
      candidate_name: "Sophie Camilleri",
      candidate_email: "sophie@example.com",
      candidate_cv_url: "https://example.com/cv-2.pdf",
      status: "interview",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(),
      jobs: { title: "Operations Manager", slug: "operations-manager", status: "active" },
      employers: { name: "Northline Group", slug: "northline-group" },
    },
  ] as LatestApplication[];

  const recentEmployers = [
    {
      id: "demo-employer-1",
      name: "Atlas Studio",
      slug: "atlas-studio",
      industry: "Design",
      location: "Sliema",
      is_verified: true,
    },
    {
      id: "demo-employer-2",
      name: "Harbor Tech",
      slug: "harbor-tech",
      industry: "Software",
      location: "Remote",
      is_verified: false,
    },
    {
      id: "demo-employer-3",
      name: "Northline Group",
      slug: "northline-group",
      industry: "Operations",
      location: "Valletta",
      is_verified: true,
    },
  ] as LatestEmployer[];

  const recentPayments = [
    {
      id: "demo-payment-1",
      amount: 59,
      status: "succeeded",
      listing_type: "featured",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    },
    {
      id: "demo-payment-2",
      amount: 29,
      status: "succeeded",
      listing_type: "standard",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    },
    {
      id: "demo-payment-3",
      amount: 59,
      status: "pending",
      listing_type: "featured",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
    },
  ] as PaymentRow[];

  const recentAlerts = [
    {
      id: "demo-alert-1",
      email: "alerts@example.com",
      sectors: ["Technology", "Design"],
      notification_method: "email",
      is_active: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    },
    {
      id: "demo-alert-2",
      email: "whatsapp@example.com",
      sectors: ["Finance"],
      notification_method: "whatsapp",
      is_active: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    },
  ] as JobAlertRow[];

  const recentSubscriptions = [
    {
      id: "demo-sub-1",
      employer_id: "demo-employer-1",
      plan_type: "professional",
      billing_cycle: "monthly",
      status: "active",
      current_period_end: null,
      trial_end: null,
      job_credits_used: 2,
      job_credits_reset_date: null,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    },
    {
      id: "demo-sub-2",
      employer_id: "demo-employer-2",
      plan_type: "basic",
      billing_cycle: "monthly",
      status: "trialing",
      current_period_end: null,
      trial_end: null,
      job_credits_used: 0,
      job_credits_reset_date: null,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
  ] as SubscriptionRow[];

  const stats = [
    { label: "Total Jobs", value: 42, note: "31 active · 9 featured" },
    { label: "Employers", value: 18, note: "14 verified" },
    { label: "Applications", value: 136, note: "21 new in the latest page" },
    { label: "Job Alerts", value: 24, note: "19 active alerts" },
    { label: "Subscriptions", value: 8, note: "7 active plans" },
    { label: "Revenue", value: formatSalary(2487), note: `${formatSalary(862)} from recent paid activity` },
  ] as const;

  return {
    stats,
    recentJobs,
    recentApplications,
    recentEmployers,
    recentPayments,
    recentAlerts,
    recentSubscriptions,
    alertStats: { total: 24, active: 19 },
    summary: {
      jobs: 42,
      activeJobs: 31,
      featuredJobs: 9,
      employers: 18,
      verifiedEmployers: 14,
      applications: 136,
      alerts: 24,
      activeAlerts: 19,
      subscriptions: 8,
      activeSubscriptions: 7,
      payments: 3,
      pendingPayments: 1,
      totalRevenue: 2487,
      paidRevenue: 862,
    },
    serviceStatus: [
      {
        label: "Production URL",
        value: process.env.NEXT_PUBLIC_URL || "demo mode",
        ok: true,
      },
      {
        label: "Admin token",
        value: process.env.INTERNAL_ADMIN_TOKEN ? "configured" : "demo mode",
        ok: true,
      },
      {
        label: "Supabase",
        value: "demo mode",
        ok: false,
      },
      {
        label: "Stripe keys",
        value: "demo mode",
        ok: false,
      },
    ],
    formattedAt: formatDate(new Date()),
  };
}

function sumAmount(rows: PaymentRow[]) {
  return rows.reduce((total, row) => total + row.amount, 0);
}

function countStatus<T extends { status: string }>(rows: T[], status: string) {
  return rows.filter((row) => row.status === status).length;
}

async function safeCountQuery(
  label: string,
  query: Promise<{ count: number | null; error: { message: string } | null }>
) {
  try {
    const result = await query;
    if (result.error) {
      console.error(`Admin dashboard ${label} query failed:`, result.error.message);
      return 0;
    }

    return result.count ?? 0;
  } catch (error) {
    console.error(
      `Admin dashboard ${label} query threw:`,
      error instanceof Error ? error.message : String(error)
    );
    return 0;
  }
}

async function safeRowsQuery<T>(
  label: string,
  query: Promise<{ data: T[] | null; error: { message: string } | null }>
) {
  try {
    const result = await query;
    if (result.error) {
      console.error(`Admin dashboard ${label} query failed:`, result.error.message);
      return [] as T[];
    }

    return (result.data ?? []) as T[];
  } catch (error) {
    console.error(
      `Admin dashboard ${label} query threw:`,
      error instanceof Error ? error.message : String(error)
    );
    return [] as T[];
  }
}

export async function getAdminDashboardData() {
  const isDemoSupabase =
    process.env.NEXT_PUBLIC_SUPABASE_URL === "https://dev.supabase.co" ||
    process.env.SUPABASE_SERVICE_ROLE_KEY === "dev-supabase-service-key";

  if (
    process.env.NODE_ENV !== "production" &&
    isDemoSupabase &&
    (!process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY)
  ) {
    return getDemoAdminDashboardData();
  }

  if (process.env.NODE_ENV !== "production" && isDemoSupabase) {
    return getDemoAdminDashboardData();
  }

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
    recentJobs,
    recentApplications,
    recentEmployers,
    recentAlerts,
    recentSubscriptions,
    allPayments,
  ] = await Promise.all([
    safeCountQuery("jobs", supabase.from("jobs").select("id", { count: "exact", head: true })),
    safeCountQuery(
      "active jobs",
      supabase
        .from("jobs")
        .select("id", { count: "exact", head: true })
        .eq("status", "active")
    ),
    safeCountQuery(
      "featured jobs",
      supabase
        .from("jobs")
        .select("id", { count: "exact", head: true })
        .eq("is_featured", true)
    ),
    safeCountQuery("employers", supabase.from("employers").select("id", { count: "exact", head: true })),
    safeCountQuery(
      "verified employers",
      supabase
        .from("employers")
        .select("id", { count: "exact", head: true })
        .eq("is_verified", true)
    ),
    safeCountQuery(
      "applications",
      supabase.from("applications").select("id", { count: "exact", head: true })
    ),
    safeCountQuery("job alerts", supabase.from("job_alerts").select("id", { count: "exact", head: true })),
    safeCountQuery(
      "active job alerts",
      supabase
        .from("job_alerts")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true)
    ),
    safeCountQuery(
      "subscriptions",
      supabase.from("subscriptions").select("id", { count: "exact", head: true })
    ),
    safeCountQuery(
      "active subscriptions",
      supabase
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("status", "active")
    ),
    safeCountQuery("payments", supabase.from("payments").select("id", { count: "exact", head: true })),
    safeCountQuery(
      "pending payments",
      supabase
        .from("payments")
        .select("id", { count: "exact", head: true })
        .neq("status", "succeeded")
    ),
    safeRowsQuery<LatestJob>(
      "recent jobs",
      supabase
        .from("jobs")
        .select("*, employers(name, slug)")
        .order("created_at", { ascending: false })
        .limit(6)
    ),
    safeRowsQuery<LatestApplication>(
      "recent applications",
      supabase
        .from("applications")
        .select("*, jobs(title, slug, status), employers(name, slug)")
        .order("created_at", { ascending: false })
        .limit(8)
    ),
    safeRowsQuery<LatestEmployer>(
      "recent employers",
      supabase
        .from("employers")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6)
    ),
    safeRowsQuery<JobAlertRow>(
      "recent job alerts",
      supabase
        .from("job_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6)
    ),
    safeRowsQuery<SubscriptionRow>(
      "recent subscriptions",
      supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6)
    ),
    safeRowsQuery<PaymentRow>(
      "all payments",
      supabase
        .from("payments")
        .select("amount,status,listing_type,created_at")
        .order("created_at", { ascending: false })
    ),
  ]);

  const recentPayments = allPayments.slice(0, 8);

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
