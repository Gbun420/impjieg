import test from "node:test";
import assert from "node:assert/strict";
import {
  deriveEmployerComplianceSummary,
  hasValidSalaryRange,
  validateSalaryRange,
} from "./compliance";

test("hasValidSalaryRange accepts a well-ordered positive range", () => {
  assert.equal(hasValidSalaryRange(30000, 45000), true);
});

test("validateSalaryRange blocks missing and invalid salary ranges", () => {
  assert.equal(validateSalaryRange(null, null), "Salary range is required before a job can be posted.");
  assert.equal(validateSalaryRange(0, 45000), "Salary range must be greater than zero.");
  assert.equal(validateSalaryRange(45000, 30000), "Maximum salary must be higher than minimum salary.");
});

test("deriveEmployerComplianceSummary counts active jobs with salary coverage", () => {
  const jobs = [
    { status: "active", salary_min: 30000, salary_max: 45000 },
    { status: "active", salary_min: null, salary_max: null },
    { status: "pending", salary_min: 28000, salary_max: 32000 },
  ];

  const summary = deriveEmployerComplianceSummary(jobs);

  assert.equal(summary.activeJobs, 2);
  assert.equal(summary.compliantActiveJobs, 1);
  assert.equal(summary.missingSalaryJobs, 1);
  assert.equal(summary.salaryCoveragePercent, 50);
  assert.equal(summary.score, 50);
  assert.equal(summary.status, "red");
});
