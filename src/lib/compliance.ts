import type { Job } from "@/lib/supabase/types";
import { SALARY_DISCLOSURE_REQUIRED } from "@/lib/constants";

export type EmployerComplianceSummary = {
  activeJobs: number;
  compliantActiveJobs: number;
  salaryCoveragePercent: number;
  missingSalaryJobs: number;
  score: number;
  status: "green" | "amber" | "red";
};

export function hasValidSalaryRange(
  salaryMin: number | null | undefined,
  salaryMax: number | null | undefined
) {
  if (salaryMin == null || salaryMax == null) {
    return false;
  }

  if (!Number.isFinite(salaryMin) || !Number.isFinite(salaryMax)) {
    return false;
  }

  if (salaryMin <= 0 || salaryMax <= 0) {
    return false;
  }

  return salaryMax > salaryMin;
}

export function validateSalaryRange(
  salaryMin: number | null | undefined,
  salaryMax: number | null | undefined
) {
  const bothNull = salaryMin == null && salaryMax == null;

  if (bothNull && !SALARY_DISCLOSURE_REQUIRED) {
    return null;
  }

  if (bothNull && SALARY_DISCLOSURE_REQUIRED) {
    return "Salary range is required before a job can be posted.";
  }

  if (salaryMin == null || salaryMax == null) {
    return SALARY_DISCLOSURE_REQUIRED
      ? "Salary range is required before a job can be posted."
      : "Both salary values must be provided together.";
  }

  if (!Number.isFinite(salaryMin) || !Number.isFinite(salaryMax)) {
    return "Salary range must use valid numeric values.";
  }

  if (salaryMin <= 0 || salaryMax <= 0) {
    return "Salary range must be greater than zero.";
  }

  if (salaryMax <= salaryMin) {
    return "Maximum salary must be higher than minimum salary.";
  }

  return null;
}

export function deriveEmployerComplianceSummary(jobs: Array<Pick<Job, "status" | "salary_min" | "salary_max">>): EmployerComplianceSummary {
  const activeJobs = jobs.filter((job) => job.status === "active");
  const compliantActiveJobs = activeJobs.filter((job) =>
    hasValidSalaryRange(job.salary_min, job.salary_max)
  );
  const activeCount = activeJobs.length;
  const compliantCount = compliantActiveJobs.length;
  const salaryCoveragePercent = activeCount
    ? Math.round((compliantCount / activeCount) * 100)
    : 0;
  const missingSalaryJobs = Math.max(activeCount - compliantCount, 0);
  const score = salaryCoveragePercent;
  const status: EmployerComplianceSummary["status"] =
    score >= 90 ? "green" : score >= 60 ? "amber" : "red";

  return {
    activeJobs: activeCount,
    compliantActiveJobs: compliantCount,
    salaryCoveragePercent,
    missingSalaryJobs,
    score,
    status,
  };
}
