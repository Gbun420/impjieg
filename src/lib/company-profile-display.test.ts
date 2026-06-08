import test from "node:test";
import assert from "node:assert/strict";
import { deriveCompanyProfileDisplay } from "./company-profile-display";

function makeBase(overrides?: Partial<Parameters<typeof deriveCompanyProfileDisplay>[0]>) {
  const emp = {
    name: "Test Company",
    is_verified: false,
    industry: "Technology",
    website: null,
    response_time_days: null,
    ...(overrides?.emp || {}),
  };

  const insights = {
    activeRoles: 0,
    featuredRoles: 0,
    salaryTransparentRoles: 0,
    topSectors: [],
    averageSalaryMin: null,
    averageSalaryMax: null,
    latestPostingDate: null,
    hasActiveJobs: false,
    hasSalaryData: false,
    salaryCoveragePercent: 0,
    ...(overrides?.insights || {}),
  };

  const trustSignals = {
    averageResponseHours: null,
    staleNewApplications: 0,
    responseBadge: "No response data",
    responseLabel: "No response history yet",
    responseDetail: "No response history available",
    responseVariant: "outline" as const,
    hasFreshJobs: false,
    ...(overrides?.trustSignals || {}),
  };

  const profileCompleteness = {
    score: 50,
    level: "medium" as const,
    missing: [],
    ...(overrides?.profileCompleteness || {}),
  };

  return deriveCompanyProfileDisplay({ emp, insights, trustSignals, profileCompleteness });
}

test("deriveCompanyProfileDisplay returns no-active-jobs state", () => {
  const display = makeBase();

  assert.equal(display.heroCtaLabel, "Create job alert");
  assert.equal(display.heroCtaHref, "/candidate/alerts");
  assert.equal(display.heroTagline, "No active roles right now");
  assert.equal(display.hiringActivityLabel, "No active roles right now");
  assert.equal(display.salaryTransparencyDetail, "No active roles to assess");
  assert.equal(display.responseLabel, "No response history yet");
  assert.equal(display.profileDetailLabel, "Profile detail: Partial");
  assert.equal(display.profileDetailVariant, "warning");
});

test("deriveCompanyProfileDisplay returns active-jobs state", () => {
  const display = makeBase({
    insights: {
      activeRoles: 5,
      featuredRoles: 2,
      salaryTransparentRoles: 3,
      topSectors: ["Technology"],
      averageSalaryMin: 40000,
      averageSalaryMax: 60000,
      latestPostingDate: "2026-05-20T10:00:00.000Z",
      hasActiveJobs: true,
      hasSalaryData: true,
      salaryCoveragePercent: 60,
    },
  });

  assert.equal(display.heroCtaLabel, "View open roles");
  assert.equal(display.heroCtaHref, "#open-roles");
  assert.equal(display.heroTagline, "Actively hiring on Impjieg");
  assert.equal(display.hiringActivityLabel, "Actively hiring: 5 roles");
  assert.equal(display.salaryTransparencyLabel, "60% salary transparency");
  assert.equal(
    display.salaryTransparencyDetail,
    "3 of 5 active roles show salary"
  );
});

test("deriveCompanyProfileDisplay shows verified employer", () => {
  const display = makeBase({
    emp: {
      name: "Verified Corp",
      is_verified: true,
      industry: "Finance",
      website: "https://example.com",
      response_time_days: 2,
    },
  });

  assert.equal(display.verificationLabel, "Verified employer");
  assert.equal(display.verificationVariant, "success");
  assert.equal(display.heroSecondaryLabel, "Visit website");
  assert.equal(display.heroSecondaryHref, "https://example.com");
});

test("deriveCompanyProfileDisplay shows unverified employer", () => {
  const display = makeBase({
    emp: {
      name: "New Co",
      is_verified: false,
      industry: null,
      website: null,
      response_time_days: null,
    },
  });

  assert.equal(display.verificationLabel, "Verification pending");
  assert.equal(display.verificationVariant, "outline");
  assert.equal(display.heroSecondaryLabel, null);
  assert.equal(display.heroSecondaryHref, null);
});

test("deriveCompanyProfileDisplay uses industry for sector link", () => {
  const display = makeBase({
    emp: {
      name: "Tech Co",
      is_verified: false,
      industry: "iGaming",
      website: null,
      response_time_days: null,
    },
  });

  assert.equal(display.sectorLinkHref, "/jobs?sector=iGaming");
  assert.equal(display.sectorLinkLabel, "Browse iGaming roles");
});

test("deriveCompanyProfileDisplay falls back to /jobs when no industry", () => {
  const display = makeBase({
    emp: {
      name: "Generic Co",
      is_verified: false,
      industry: null,
      website: null,
      response_time_days: null,
    },
  });

  assert.equal(display.sectorLinkHref, "/jobs");
  assert.equal(display.sectorLinkLabel, "Browse all roles");
});

test("deriveCompanyProfileDisplay shows high profile detail", () => {
  const display = makeBase({
    profileCompleteness: {
      score: 85,
      level: "high",
      missing: [],
    },
  });

  assert.equal(display.profileDetailLabel, "Profile detail: Strong");
  assert.equal(display.profileDetailVariant, "success");
});

test("deriveCompanyProfileDisplay shows low profile detail", () => {
  const display = makeBase({
    profileCompleteness: {
      score: 10,
      level: "low",
      missing: [],
    },
  });

  assert.equal(display.profileDetailLabel, "Profile detail: Limited");
  assert.equal(display.profileDetailVariant, "outline");
});

test("deriveCompanyProfileDisplay handles single active role", () => {
  const display = makeBase({
    insights: {
      activeRoles: 1,
      featuredRoles: 0,
      salaryTransparentRoles: 1,
      topSectors: ["Technology"],
      averageSalaryMin: 40000,
      averageSalaryMax: 50000,
      latestPostingDate: "2026-05-20T10:00:00.000Z",
      hasActiveJobs: true,
      hasSalaryData: true,
      salaryCoveragePercent: 100,
    },
  });

  assert.equal(display.hiringActivityLabel, "Actively hiring: 1 role");
  assert.equal(
    display.salaryTransparencyDetail,
    "1 of 1 active role shows salary"
  );
});

test("deriveCompanyProfileDisplay handles responsive trust signal", () => {
  const display = makeBase({
    trustSignals: {
      averageResponseHours: 12,
      staleNewApplications: 0,
      responseBadge: "Responsive",
      responseLabel: "Responsive",
      responseDetail: "Avg. first response in 12h",
      responseVariant: "success",
      hasFreshJobs: true,
    },
  });

  assert.equal(display.responseLabel, "Responsive");
  assert.equal(display.responseDetail, "Avg. first response in 12h");
  assert.equal(display.responseVariant, "success");
});
