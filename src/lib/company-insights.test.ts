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
  assert.equal(insights.hasActiveJobs, true);
  assert.equal(insights.hasSalaryData, true);
  assert.equal(insights.salaryCoveragePercent, 67);
});

test("deriveCompanyInsights returns zeroed state for no jobs", () => {
  const insights = deriveCompanyInsights([]);

  assert.equal(insights.activeRoles, 0);
  assert.equal(insights.featuredRoles, 0);
  assert.equal(insights.salaryTransparentRoles, 0);
  assert.equal(insights.topSectors.length, 0);
  assert.equal(insights.averageSalaryMin, null);
  assert.equal(insights.averageSalaryMax, null);
  assert.equal(insights.latestPostingDate, null);
  assert.equal(insights.hasActiveJobs, false);
  assert.equal(insights.hasSalaryData, false);
  assert.equal(insights.salaryCoveragePercent, 0);
});

test("deriveCompanyInsights handles jobs with no salary data", () => {
  const insights = deriveCompanyInsights([
    {
      sector: "iGaming",
      is_featured: false,
      salary_min: null,
      salary_max: null,
      created_at: "2026-05-20T10:00:00.000Z",
    },
    {
      sector: "Technology",
      is_featured: false,
      salary_min: null,
      salary_max: null,
      created_at: "2026-05-22T10:00:00.000Z",
    },
  ]);

  assert.equal(insights.activeRoles, 2);
  assert.equal(insights.hasActiveJobs, true);
  assert.equal(insights.hasSalaryData, false);
  assert.equal(insights.salaryTransparentRoles, 0);
  assert.equal(insights.salaryCoveragePercent, 0);
  assert.equal(insights.averageSalaryMin, null);
  assert.equal(insights.averageSalaryMax, null);
});

test("deriveCompanyInsights handles partial salary data (only salary_min)", () => {
  const insights = deriveCompanyInsights([
    {
      sector: "Technology",
      is_featured: false,
      salary_min: 35000,
      salary_max: null,
      created_at: "2026-05-20T10:00:00.000Z",
    },
    {
      sector: "Finance",
      is_featured: false,
      salary_min: null,
      salary_max: null,
      created_at: "2026-05-22T10:00:00.000Z",
    },
  ]);

  assert.equal(insights.activeRoles, 2);
  assert.equal(insights.hasActiveJobs, true);
  assert.equal(insights.hasSalaryData, true);
  assert.equal(insights.salaryTransparentRoles, 1);
  assert.equal(insights.salaryCoveragePercent, 50);
  assert.equal(insights.averageSalaryMin, 35000);
  assert.equal(insights.averageSalaryMax, null);
});

test("deriveCompanyInsights handles partial salary data (only salary_max)", () => {
  const insights = deriveCompanyInsights([
    {
      sector: "Technology",
      is_featured: false,
      salary_min: null,
      salary_max: 60000,
      created_at: "2026-05-20T10:00:00.000Z",
    },
    {
      sector: "Technology",
      is_featured: false,
      salary_min: null,
      salary_max: 70000,
      created_at: "2026-05-22T10:00:00.000Z",
    },
  ]);

  assert.equal(insights.activeRoles, 2);
  assert.equal(insights.hasActiveJobs, true);
  assert.equal(insights.hasSalaryData, true);
  assert.equal(insights.salaryTransparentRoles, 2);
  assert.equal(insights.salaryCoveragePercent, 100);
  assert.equal(insights.averageSalaryMin, null);
  assert.equal(insights.averageSalaryMax, 65000);
});

test("deriveCompanyInsights identifies no featured roles", () => {
  const insights = deriveCompanyInsights([
    {
      sector: "Technology",
      is_featured: false,
      salary_min: 40000,
      salary_max: 50000,
      created_at: "2026-05-20T10:00:00.000Z",
    },
    {
      sector: "Finance",
      is_featured: false,
      salary_min: 50000,
      salary_max: 60000,
      created_at: "2026-05-22T10:00:00.000Z",
    },
  ]);

  assert.equal(insights.featuredRoles, 0);
  assert.equal(insights.hasActiveJobs, true);
});

test("deriveCompanyInsights sorts sectors by count", () => {
  const insights = deriveCompanyInsights([
    {
      sector: "Technology",
      is_featured: false,
      salary_min: null,
      salary_max: null,
      created_at: "2026-05-20T10:00:00.000Z",
    },
    {
      sector: "Technology",
      is_featured: false,
      salary_min: null,
      salary_max: null,
      created_at: "2026-05-21T10:00:00.000Z",
    },
    {
      sector: "Technology",
      is_featured: false,
      salary_min: null,
      salary_max: null,
      created_at: "2026-05-22T10:00:00.000Z",
    },
    {
      sector: "Finance",
      is_featured: false,
      salary_min: null,
      salary_max: null,
      created_at: "2026-05-19T10:00:00.000Z",
    },
  ]);

  assert.equal(insights.topSectors[0], "Technology");
  assert.equal(insights.topSectors[1], "Finance");
  assert.equal(insights.topSectors.length, 2);
});
