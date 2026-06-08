import type { Employer } from "@/lib/supabase/types";

type CompanyInsights = {
  activeRoles: number;
  featuredRoles: number;
  salaryTransparentRoles: number;
  topSectors: string[];
  averageSalaryMin: number | null;
  averageSalaryMax: number | null;
  latestPostingDate: string | null;
  hasActiveJobs: boolean;
  hasSalaryData: boolean;
  salaryCoveragePercent: number;
};

type TrustSignals = {
  averageResponseHours: number | null;
  staleNewApplications: number;
  responseBadge: string;
  responseLabel: string;
  responseDetail: string;
  responseVariant: "success" | "warning" | "outline" | "info";
  hasFreshJobs: boolean;
};

type ProfileCompleteness = {
  score: number;
  level: "high" | "medium" | "low";
  missing: string[];
};

export type CompanyProfileDisplay = {
  heroCtaLabel: string;
  heroCtaHref: string;
  heroSecondaryLabel: string | null;
  heroSecondaryHref: string | null;
  heroTagline: string;
  verificationLabel: string;
  verificationVariant: "success" | "warning" | "outline" | "info";
  hiringActivityLabel: string;
  salaryTransparencyLabel: string;
  salaryTransparencyDetail: string;
  responseLabel: string;
  responseDetail: string;
  responseVariant: "success" | "warning" | "outline" | "info";
  profileDetailLabel: string;
  profileDetailVariant: "success" | "warning" | "outline" | "info";
  aboutLabel: string;
  hiringProcessLabel: string;
  sectorLinkHref: string;
  sectorLinkLabel: string;
};

export function deriveCompanyProfileDisplay({
  emp,
  insights,
  trustSignals,
  profileCompleteness,
}: {
  emp: Pick<Employer, "name" | "is_verified" | "industry" | "website" | "response_time_days">;
  insights: CompanyInsights;
  trustSignals: TrustSignals;
  profileCompleteness: ProfileCompleteness;
}): CompanyProfileDisplay {
  const hasActiveJobs = insights.hasActiveJobs;

  const heroCtaLabel = hasActiveJobs ? "View open roles" : "Create job alert";
  const heroCtaHref = hasActiveJobs ? "#open-roles" : "/candidate/alerts";

  const heroSecondaryLabel = emp.website ? "Visit website" : null;
  const heroSecondaryHref = emp.website || null;

  const heroTagline = hasActiveJobs
    ? `Actively hiring on Impjieg`
    : `No active roles right now`;

  const verificationLabel = emp.is_verified
    ? "Verified employer"
    : "Verification pending";
  const verificationVariant = emp.is_verified ? "success" : "outline";

  const hiringActivityLabel = hasActiveJobs
    ? `Actively hiring: ${insights.activeRoles} role${insights.activeRoles === 1 ? "" : "s"}`
    : "No active roles right now";

  let salaryTransparencyLabel: string;
  let salaryTransparencyDetail: string;
  if (hasActiveJobs) {
    salaryTransparencyLabel = `${insights.salaryCoveragePercent}% salary transparency`;
    salaryTransparencyDetail = `${insights.salaryTransparentRoles} of ${insights.activeRoles} active role${insights.activeRoles === 1 ? "" : "s"} show${insights.activeRoles === 1 ? "s" : ""} salary`;
  } else {
    salaryTransparencyLabel = "Salary transparency";
    salaryTransparencyDetail = "No active roles to assess";
  }

  const responseLabel = trustSignals.responseLabel;
  const responseDetail = trustSignals.responseDetail;
  const responseVariant = trustSignals.responseVariant;

  const profileDetailLabel =
    profileCompleteness.level === "high"
      ? "Profile detail: Strong"
      : profileCompleteness.level === "medium"
        ? "Profile detail: Partial"
        : "Profile detail: Limited";
  const profileDetailVariant =
    profileCompleteness.level === "high"
      ? "success"
      : profileCompleteness.level === "medium"
        ? "warning"
        : "outline";

  const aboutLabel = emp.is_verified
    ? `About ${emp.name}`
    : `About this employer`;

  const hiringProcessLabel = emp.response_time_days
    ? `Hiring process`
    : `Hiring process`;

  const sectorLinkHref = emp.industry
    ? `/jobs?sector=${encodeURIComponent(emp.industry)}`
    : "/jobs";
  const sectorLinkLabel = emp.industry
    ? `Browse ${emp.industry} roles`
    : "Browse all roles";

  return {
    heroCtaLabel,
    heroCtaHref,
    heroSecondaryLabel,
    heroSecondaryHref,
    heroTagline,
    verificationLabel,
    verificationVariant,
    hiringActivityLabel,
    salaryTransparencyLabel,
    salaryTransparencyDetail,
    responseLabel,
    responseDetail,
    responseVariant,
    profileDetailLabel,
    profileDetailVariant,
    aboutLabel,
    hiringProcessLabel,
    sectorLinkHref,
    sectorLinkLabel,
  };
}
