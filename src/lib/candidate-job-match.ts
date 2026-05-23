type CandidateMatchInput = {
  skills: string[];
  sectors: string[];
  job_types: string[];
  remote_preference: string | null;
  desired_salary_min: number | null;
  experience_years: number | null;
};

type JobMatchInput = {
  sector: string;
  job_type: string;
  remote_type: string | null;
  salary_min: number | null;
  skills: string[];
  seniority: string | null;
  is_featured: boolean;
};

const SENIORITY_EXPERIENCE_MINIMUMS: Record<string, number> = {
  "Entry Level": 0,
  Junior: 1,
  "Mid Level": 3,
  Senior: 5,
  Lead: 7,
  Manager: 6,
  Director: 8,
  Executive: 10,
};

export function scoreCandidateJobMatch({
  candidate,
  job,
}: {
  candidate: CandidateMatchInput;
  job: JobMatchInput;
}) {
  let score = 0;
  const strengths: string[] = [];
  const gaps: string[] = [];

  if (candidate.sectors?.includes(job.sector)) {
    score += 20;
    strengths.push(`Matches your ${job.sector} background`);
  } else {
    gaps.push(`Different sector from your usual focus (${job.sector})`);
  }

  if (candidate.job_types?.includes(job.job_type)) {
    score += 15;
    strengths.push(`${job.job_type} role matches your preferred job type`);
  }

  if (
    candidate.remote_preference &&
    candidate.remote_preference !== "No preference" &&
    candidate.remote_preference === job.remote_type
  ) {
    score += 10;
    strengths.push(`${job.remote_type} work arrangement matches your preference`);
  }

  const normalizedCandidateSkills = candidate.skills.map((skill) => skill.toLowerCase());
  const matchingSkills = job.skills.filter((skill) =>
    normalizedCandidateSkills.some((candidateSkill) => skill.toLowerCase().includes(candidateSkill))
  );
  const missingSkills = job.skills.filter(
    (skill) => !matchingSkills.includes(skill)
  );

  if (matchingSkills.length > 0) {
    score += Math.min(matchingSkills.length * 7, 30);
    strengths.push(`${matchingSkills.length} matching skills`);
  }

  if (missingSkills.length > 0) {
    gaps.push(`Missing: ${missingSkills.slice(0, 3).join(", ")}`);
  }

  if (candidate.desired_salary_min && job.salary_min) {
    if (job.salary_min >= candidate.desired_salary_min) {
      score += 10;
      strengths.push("Meets salary expectations");
    } else {
      gaps.push("Below desired salary range");
    }
  }

  const requiredExperience = job.seniority
    ? SENIORITY_EXPERIENCE_MINIMUMS[job.seniority] ?? null
    : null;

  if (requiredExperience !== null && candidate.experience_years !== null) {
    if (candidate.experience_years >= requiredExperience) {
      score += 10;
      strengths.push("Experience level fits the seniority");
    } else {
      gaps.push("Experience may be below the expected seniority");
    }
  }

  if (job.is_featured) {
    score += 5;
  }

  const finalScore = Math.max(0, Math.min(score, 100));
  const matchLevel =
    finalScore >= 80
      ? "Excellent"
      : finalScore >= 60
        ? "Good"
        : finalScore >= 40
          ? "Fair"
          : "Low";

  return {
    score: finalScore,
    matchLevel,
    strengths,
    gaps,
  };
}
