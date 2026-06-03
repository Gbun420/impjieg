import test from "node:test";
import assert from "node:assert/strict";
import { scoreCandidateJobMatch } from "./candidate-job-match";

test("scoreCandidateJobMatch rewards aligned skills, sector, type, and salary", () => {
  const match = scoreCandidateJobMatch({
    candidate: {
      skills: ["TypeScript", "Node.js", "PostgreSQL"],
      sectors: ["Technology"],
      job_types: ["Full-time"],
      remote_preference: "Hybrid",
      desired_salary_min: 50000,
      experience_years: 5,
    },
    job: {
      sector: "Technology",
      job_type: "Full-time",
      remote_type: "Hybrid",
      salary_min: 55000,
      skills: ["Node.js", "TypeScript", "AWS"],
      seniority: "Senior",
      is_featured: true,
    },
  });

  assert.equal(match.matchLevel, "Excellent");
  assert.ok(match.score >= 80);
  assert.match(match.strengths.join(" "), /matching skills/i);
});

test("scoreCandidateJobMatch surfaces meaningful gaps", () => {
  const match = scoreCandidateJobMatch({
    candidate: {
      skills: ["Excel"],
      sectors: ["Finance & Banking"],
      job_types: ["Part-time"],
      remote_preference: "On-site",
      desired_salary_min: 70000,
      experience_years: 1,
    },
    job: {
      sector: "Technology",
      job_type: "Full-time",
      remote_type: "Remote",
      salary_min: 40000,
      skills: ["React", "TypeScript", "Next.js"],
      seniority: "Senior",
      is_featured: false,
    },
  });

  assert.equal(match.matchLevel, "Low");
  assert.match(match.gaps.join(" "), /salary/i);
  assert.match(match.gaps.join(" "), /missing/i);
});
