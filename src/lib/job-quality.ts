type JobQualityInput = {
  title: string;
  description: string;
  salary_min: number | null;
  salary_max: number | null;
  skills: string[];
  benefits: string[];
  application_email: string | null;
  application_url: string | null;
};

export function deriveJobQuality(job: JobQualityInput) {
  let score = 0;
  const issues: string[] = [];

  if (job.title.trim().length >= 8) {
    score += 10;
  } else {
    issues.push("Use a more specific job title.");
  }

  if (job.description.trim().length >= 300) {
    score += 25;
  } else {
    issues.push("Add a fuller job description with responsibilities and requirements.");
  }

  if (job.salary_min || job.salary_max) {
    score += 20;
  } else {
    issues.push("Add a salary range to improve candidate trust and conversion.");
  }

  if (job.skills.length >= 3) {
    score += 15;
  } else {
    issues.push("Add at least three core skills so matching and search work better.");
  }

  if (job.benefits.length >= 2) {
    score += 10;
  } else {
    issues.push("Add benefits or perks to make the listing more competitive.");
  }

  if (job.application_email || job.application_url) {
    score += 20;
  } else {
    issues.push("Add an external application method for candidates who prefer direct apply.");
  }

  const level = score >= 80 ? "high" : score >= 55 ? "medium" : "low";

  return {
    score,
    level,
    issues,
  };
}
