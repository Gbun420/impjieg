type EmployerProfileCompletenessInput = {
  description: string | null;
  website: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  company_size: string | null;
  industry: string | null;
  culture_summary: string | null;
  hiring_process: string | null;
  workplace_highlights: string[];
  response_time_days: number | null;
};

export function deriveEmployerProfileCompleteness(
  employer: EmployerProfileCompletenessInput
) {
  let score = 0;
  const missing: string[] = [];

  if (employer.description?.trim()) score += 15;
  else missing.push("Add a company description.");

  if (employer.website?.trim()) score += 10;
  else missing.push("Add a company website.");

  if (employer.logo_url?.trim()) score += 10;
  else missing.push("Add a company logo.");

  if (employer.cover_image_url?.trim()) score += 5;
  else missing.push("Add a cover image.");

  if (employer.company_size?.trim()) score += 10;
  else missing.push("Add company size.");

  if (employer.industry?.trim()) score += 10;
  else missing.push("Add industry.");

  if (employer.culture_summary?.trim()) score += 15;
  else missing.push("Add a culture summary.");

  if (employer.hiring_process?.trim()) score += 15;
  else missing.push("Add your hiring process.");

  if (employer.workplace_highlights.length >= 2) score += 5;
  else missing.push("Add workplace highlights or benefits.");

  if (employer.response_time_days && employer.response_time_days > 0) score += 5;
  else missing.push("Set an expected response time.");

  const level = score >= 75 ? "high" : score >= 45 ? "medium" : "low";

  return { score, level, missing };
}
