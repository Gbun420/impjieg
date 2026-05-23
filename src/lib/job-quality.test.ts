import test from "node:test";
import assert from "node:assert/strict";
import { deriveJobQuality } from "./job-quality";

test("deriveJobQuality scores a complete listing highly", () => {
  const quality = deriveJobQuality({
    title: "Senior Backend Engineer",
    description: "A".repeat(500),
    salary_min: 50000,
    salary_max: 65000,
    skills: ["Node.js", "TypeScript", "PostgreSQL", "AWS"],
    benefits: ["Private health insurance", "Remote budget"],
    application_email: "jobs@example.com",
    application_url: null,
  });

  assert.equal(quality.level, "high");
  assert.equal(quality.issues.length, 0);
});

test("deriveJobQuality flags missing salary, skills, and benefits", () => {
  const quality = deriveJobQuality({
    title: "Developer",
    description: "Short description",
    salary_min: null,
    salary_max: null,
    skills: [],
    benefits: [],
    application_email: null,
    application_url: null,
  });

  assert.equal(quality.level, "low");
  assert.match(quality.issues.join(" "), /salary range/i);
  assert.match(quality.issues.join(" "), /skills/i);
  assert.match(quality.issues.join(" "), /benefits/i);
  assert.match(quality.issues.join(" "), /application method/i);
});
