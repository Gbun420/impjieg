import test from "node:test";
import assert from "node:assert/strict";
import { deriveCompanyInsights } from "./company-insights";

test("deriveCompanyInsights summarizes hiring and salary transparency data", () => {
  const insights = deriveCompanyInsights([
    {
      sector: "Technology",
      is_featured: true,
      salary_min: 40000,
      salary_max: 50000,
      created_at: "2026-05-20T10:00:00.000Z",
    },
    {
      sector: "Technology",
      is_featured: false,
      salary_min: 45000,
      salary_max: 55000,
      created_at: "2026-05-22T10:00:00.000Z",
    },
    {
      sector: "Finance",
      is_featured: false,
      salary_min: null,
      salary_max: null,
      created_at: "2026-05-18T10:00:00.000Z",
    },
  ]);

  assert.equal(insights.activeRoles, 3);
  assert.equal(insights.featuredRoles, 1);
  assert.equal(insights.salaryTransparentRoles, 2);
  assert.equal(insights.topSectors[0], "Technology");
  assert.equal(insights.averageSalaryMin, 42500);
  assert.equal(insights.averageSalaryMax, 52500);
  assert.equal(insights.latestPostingDate, "2026-05-22T10:00:00.000Z");
});
