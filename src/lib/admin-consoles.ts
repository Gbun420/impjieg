import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getAdminDashboardData } from "@/lib/admin-dashboard";
import { getSupabaseServiceKey, getSupabaseUrl } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/types";
import type {
  Application,
  CandidateAlert,
  CandidateApplication,
  CandidateProfile,
  Employer,
  Job,
  JobAlert,
  Payment,
} from "@/lib/supabase/types";
import { formatDate, formatSalary } from "@/lib/utils";

export type AdminConsoleSection =
  | "dashboard"
  | "jobs"
  | "employers"
  | "candidates"
  | "applications"
  | "payments"
  | "alerts"
  | "subscriptions"
  | "commercial-grants"
  | "audit-log";

export type AdminConsoleNavItem = {
  href: string;
  label: string;
};

export const adminConsoleSections: Array<{
  slug: AdminConsoleSection;
  href: string;
  label: string;
}> = [
  { slug: "dashboard", href: "/admin/dashboard", label: "Overview" },
  { slug: "jobs", href: "/admin/jobs", label: "Jobs" },
  { slug: "employers", href: "/admin/employers", label: "Employers" },
  { slug: "candidates", href: "/admin/candidates", label: "Candidates" },
  { slug: "applications", href: "/admin/applications", label: "Applications" },
  { slug: "payments", href: "/admin/payments", label: "Payments" },
  { slug: "alerts", href: "/admin/alerts", label: "Alerts" },
  { slug: "subscriptions", href: "/admin/subscriptions", label: "Subscriptions" },
  { slug: "commercial-grants", href: "/admin/commercial-grants", label: "Grants" },
  { slug: "audit-log", href: "/admin/audit-log", label: "Audit log" },
] as const;

export const adminConsoleNavItems: AdminConsoleNavItem[] = adminConsoleSections.map(
  ({ href, label }) => ({
    href,
    label,
  })
);

export function resolveAdminConsoleSection(segments?: string[] | null) {
  const section = segments?.[0];
  if (!section) {
    return null;
  }

  return (
    adminConsoleSections.find((item) => item.slug === section)?.slug ?? null
  );
}

export function getAdminConsoleSectionMeta(section: AdminConsoleSection) {
  const meta: Record<
    AdminConsoleSection,
    { title: string; description: string; eyebrow: string }
  > = {
    dashboard: {
      title: "Operations overview",
      description:
        "Live production metrics, account health, and the latest events across the marketplace.",
      eyebrow: "Operations hub",
    },
    jobs: {
      title: "Jobs operations",
      description:
        "Review live listings, status changes, traffic, and application volume.",
      eyebrow: "Marketplace operations",
    },
    employers: {
      title: "Employer accounts",
      description:
        "Check company records, verification state, and employer trust signals.",
      eyebrow: "Account operations",
    },
    candidates: {
      title: "Candidate intelligence",
      description:
        "Track candidate profiles, applications, and active job alerts.",
      eyebrow: "Talent operations",
    },
    applications: {
      title: "Hiring pipeline",
      description:
        "Monitor recent applications and pipeline activity across live jobs.",
      eyebrow: "Pipeline operations",
    },
    payments: {
      title: "Billing and revenue",
      description:
        "Review paid listing activity, pending payments, and revenue signals.",
      eyebrow: "Billing operations",
    },
    alerts: {
      title: "Notification activity",
      description:
        "Inspect email and WhatsApp alert activity across active subscriptions.",
      eyebrow: "Notification operations",
    },
    subscriptions: {
      title: "Plan management",
      description:
        "Monitor live plan states, billing cycles, and credit usage.",
      eyebrow: "Subscription operations",
    },
    "commercial-grants": {
      title: "Commercial grants",
      description:
        "Manage manual commercial entitlements, complimentary access, and discounts.",
      eyebrow: "Revenue operations",
    },
    "audit-log": {
      title: "Security audit log",
      description:
        "Review the latest recorded admin actions and security-sensitive events.",
      eyebrow: "Security operations",
    },
  };

  return meta[section];
}

type LatestJob = Job & { employers: Pick<Employer, "name" | "slug"> | null };
type LatestApplication = Application & {
  jobs: Pick<Job, "title" | "slug" | "status" | "employer_id"> | null;
  employers: Pick<Employer, "name" | "slug"> | null;
};
type LatestEmployer = Employer;
type LatestSubscription = Database["public"]["Tables"]["subscriptions"]["Row"];
type LatestPayment = Payment;
type LatestJobAlert = JobAlert;
type LatestCandidateProfile = CandidateProfile;
type LatestCandidateApplication = CandidateApplication & {
  jobs: Pick<Job, "title" | "slug" | "status"> | null;
  employers: Pick<Employer, "name" | "slug"> | null;
};
type LatestCandidateAlert = CandidateAlert;

type AdminAuditRow = {
  id: string;
  admin_email: string;
  action: string;
  entity_type: string;
  entity_id: string;
  before_value: unknown | null;
  after_value: unknown | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

export type AdminConsoleData = Awaited<ReturnType<typeof getAdminDashboardData>> & {
  candidateProfiles: LatestCandidateProfile[];
  candidateApplications: LatestCandidateApplication[];
  candidateAlerts: LatestCandidateAlert[];
  auditLogs: AdminAuditRow[];
};

function createAdminServiceClient() {
  return createServiceClient(
    getSupabaseUrl(),
    getSupabaseServiceKey()
  );
}

function sumAmount(rows: LatestPayment[]) {
  return rows.reduce((total, row) => total + row.amount, 0);
}

function serializeAuditValue(value: unknown) {
  if (value === null || value === undefined) {
    return "—";
  }

  if (typeof value === "string") {
    return value.length > 96 ? `${value.slice(0, 96)}…` : value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  try {
    const json = JSON.stringify(value);
    return json.length > 120 ? `${json.slice(0, 120)}…` : json;
  } catch {
    return "Unserializable value";
  }
}

function getDemoAdminConsoleData() {
  const candidateProfiles = [
    {
      id: "demo-candidate-1",
      user_id: "demo-user-1",
      full_name: "Mia Borg",
      headline: "Product Designer",
      bio: "Design systems and product strategy",
      phone: null,
      location: "Mosta",
      website: null,
      linkedin_url: null,
      skills: ["Figma", "Design systems", "Research"],
      experience_years: 6,
      desired_salary_min: 38000,
      desired_salary_max: 52000,
      job_types: ["full-time"],
      sectors: ["Design", "Technology"],
      remote_preference: "hybrid",
      is_open_to_work: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    },
  ] as LatestCandidateProfile[];

  const candidateApplications = [
    {
      id: "demo-candidate-app-1",
      user_id: "demo-user-1",
      job_id: "demo-job-1",
      application_id: "demo-app-1",
      status: "shortlisted",
      notes: null,
      applied_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      jobs: { title: "Senior Product Designer", slug: "senior-product-designer", status: "active" },
      employers: { name: "Atlas Studio", slug: "atlas-studio" },
    },
  ] as LatestCandidateApplication[];

  const candidateAlerts = [
    {
      id: "demo-candidate-alert-1",
      user_id: "demo-user-1",
      name: "Design and product roles",
      sectors: ["Design", "Technology"],
      job_types: ["full-time"],
      locations: ["Malta", "Remote"],
      salary_min: 35000,
      remote_type: "hybrid",
      frequency: "weekly",
      is_active: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    },
  ] as LatestCandidateAlert[];

  const auditLogs = [
    {
      id: "demo-audit-1",
      admin_email: "admin@example.com",
      action: "admin_login",
      entity_type: "admin_session",
      entity_id: "demo-admin",
      before_value: null,
      after_value: { success: true },
      ip_address: null,
      user_agent: null,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
  ] as AdminAuditRow[];

  const dashboard = {
    stats: [
      { label: "Total Jobs", value: 42, note: "31 active · 9 featured" },
      { label: "Employers", value: 18, note: "14 verified" },
      { label: "Applications", value: 136, note: "21 new in the latest page" },
      { label: "Job Alerts", value: 24, note: "19 active alerts" },
      { label: "Subscriptions", value: 8, note: "7 active plans" },
      { label: "Revenue", value: formatSalary(2487), note: `${formatSalary(862)} from recent paid activity` },
    ] as const,
    recentJobs: [
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
    ] as LatestJob[],
    recentApplications: [
      {
        id: "demo-app-1",
        candidate_name: "Mia Borg",
        candidate_email: "mia@example.com",
        candidate_cv_url: "https://example.com/cv.pdf",
        status: "shortlisted",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        jobs: { title: "Senior Product Designer", slug: "senior-product-designer", status: "active", employer_id: "demo-employer-1" },
        employers: { name: "Atlas Studio", slug: "atlas-studio" },
      },
      {
        id: "demo-app-2",
        candidate_name: "Liam Grech",
        candidate_email: "liam@example.com",
        candidate_cv_url: null,
        status: "applied",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
        jobs: { title: "Full Stack Engineer", slug: "full-stack-engineer", status: "draft", employer_id: "demo-employer-2" },
        employers: { name: "Harbor Tech", slug: "harbor-tech" },
      },
    ] as LatestApplication[],
    recentEmployers: [
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
    ] as LatestEmployer[],
    recentPayments: [
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
    ] as LatestPayment[],
    recentAlerts: [
      {
        id: "demo-alert-1",
        email: "alerts@example.com",
        sectors: ["Technology", "Design"],
        notification_method: "email",
        is_active: true,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
      },
    ] as LatestJobAlert[],
    recentSubscriptions: [
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
    ] as LatestSubscription[],
  };

  const allPayments = dashboard.recentPayments;
  const totalRevenue = sumAmount(allPayments);
  const paidRevenue = sumAmount(
    allPayments.filter((payment) => payment.status === "succeeded" || payment.status === "paid")
  );

  return {
    ...dashboard,
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
      payments: 2,
      pendingPayments: 0,
      totalRevenue,
      paidRevenue,
    },
    serviceStatus: [
      {
        label: "Production URL",
        value: "demo mode",
        ok: true,
      },
      {
        label: "Admin token",
        value: "configured",
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
    candidateProfiles,
    candidateApplications,
    candidateAlerts,
    auditLogs,
  };
}

function isDemoSupabase() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL === "https://dev.supabase.co" ||
    process.env.SUPABASE_SERVICE_ROLE_KEY === "dev-supabase-service-key"
  );
}

export async function getAdminConsoleData() {
  const dashboard = await getAdminDashboardData();
  if (process.env.NODE_ENV !== "production" && isDemoSupabase()) {
    return getDemoAdminConsoleData();
  }

  const supabase = createAdminServiceClient();

  const [
    candidateProfilesResult,
    candidateApplicationsResult,
    candidateAlertsResult,
    auditLogsResult,
  ] = await Promise.all([
    supabase
      .from("candidate_profiles")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(6),
    supabase
      .from("candidate_applications")
      .select("*, jobs(title, slug, status), employers(name, slug)")
      .order("applied_at", { ascending: false })
      .limit(8),
    supabase
      .from("candidate_alerts")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(6),
    supabase
      .from("admin_audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  const candidateProfiles = (candidateProfilesResult.data || []) as LatestCandidateProfile[];
  const candidateApplications = (candidateApplicationsResult.data || []) as LatestCandidateApplication[];
  const candidateAlerts = (candidateAlertsResult.data || []) as LatestCandidateAlert[];
  const auditLogs = (auditLogsResult.data || []) as AdminAuditRow[];

  return {
    ...dashboard,
    candidateProfiles,
    candidateApplications,
    candidateAlerts,
    auditLogs,
  };
}

function formatAuditSummary(value: unknown) {
  return serializeAuditValue(value);
}

export function formatAuditEntryValue(beforeValue: unknown | null, afterValue: unknown | null) {
  const before = formatAuditSummary(beforeValue);
  const after = formatAuditSummary(afterValue);

  if (before === "—" && after === "—") {
    return "No field changes recorded";
  }

  return `${before} → ${after}`;
}
