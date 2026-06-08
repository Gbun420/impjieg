import test from "node:test";
import assert from "node:assert/strict";
import { deriveEmployerTrustSignals } from "./employer-trust-signals";

test("deriveEmployerTrustSignals classifies responsive employers", () => {
  const result = deriveEmployerTrustSignals({
    activeJobsCount: 4,
    applications: [
      {
        status: "reviewed",
        created_at: "2026-05-20T09:00:00.000Z",
        updated_at: "2026-05-20T21:00:00.000Z",
      },
      {
        status: "shortlisted",
        created_at: "2026-05-21T09:00:00.000Z",
        updated_at: "2026-05-22T09:00:00.000Z",
      },
    ],
    now: new Date("2026-05-23T09:00:00.000Z"),
  });

  assert.equal(result.responseBadge, "Responsive");
  assert.equal(result.responseLabel, "Responsive");
  assert.ok(result.responseDetail.includes("Avg. first response"));
  assert.equal(result.responseVariant, "success");
  assert.equal(result.averageResponseHours, 18);
  assert.equal(result.hasFreshJobs, true);
});

test("deriveEmployerTrustSignals flags slow or inactive employers", () => {
  const result = deriveEmployerTrustSignals({
    activeJobsCount: 0,
    applications: [
      {
        status: "new",
        created_at: "2026-05-15T09:00:00.000Z",
        updated_at: "2026-05-15T09:00:00.000Z",
      },
      {
        status: "reviewed",
        created_at: "2026-05-10T09:00:00.000Z",
        updated_at: "2026-05-15T09:00:00.000Z",
      },
    ],
    now: new Date("2026-05-23T09:00:00.000Z"),
  });

  assert.equal(result.responseBadge, "Slow to respond");
  assert.equal(result.responseLabel, "Slow to respond");
  assert.equal(result.responseVariant, "warning");
  assert.equal(result.hasFreshJobs, false);
  assert.equal(result.staleNewApplications, 1);
});

test("deriveEmployerTrustSignals returns neutral state with no applications", () => {
  const result = deriveEmployerTrustSignals({
    activeJobsCount: 0,
    applications: [],
    now: new Date("2026-05-23T09:00:00.000Z"),
  });

  assert.equal(result.responseBadge, "No response data");
  assert.equal(result.responseLabel, "No response history yet");
  assert.equal(result.responseDetail, "No response history available");
  assert.equal(result.responseVariant, "outline");
  assert.equal(result.averageResponseHours, null);
  assert.equal(result.staleNewApplications, 0);
  assert.equal(result.hasFreshJobs, false);
});

test("deriveEmployerTrustSignals uses expectedResponseDays fallback when no applications", () => {
  const result = deriveEmployerTrustSignals({
    activeJobsCount: 0,
    applications: [],
    expectedResponseDays: 3,
    now: new Date("2026-05-23T09:00:00.000Z"),
  });

  assert.equal(result.responseBadge, "Expected response");
  assert.equal(result.responseLabel, "Employer responds");
  assert.equal(result.responseDetail, "Expected within 3 days");
  assert.equal(result.responseVariant, "info");
  assert.equal(result.averageResponseHours, null);
});

test("deriveEmployerTrustSignals prefers actual response data over expectedResponseDays", () => {
  const result = deriveEmployerTrustSignals({
    activeJobsCount: 2,
    applications: [
      {
        status: "reviewed",
        created_at: "2026-05-20T09:00:00.000Z",
        updated_at: "2026-05-20T21:00:00.000Z",
      },
    ],
    expectedResponseDays: 5,
    now: new Date("2026-05-23T09:00:00.000Z"),
  });

  assert.equal(result.responseBadge, "Responsive");
  assert.equal(result.responseLabel, "Responsive");
  assert.equal(result.responseVariant, "success");
  assert.equal(result.averageResponseHours, 12);
});

test("deriveEmployerTrustSignals classifies moderate response time", () => {
  const result = deriveEmployerTrustSignals({
    activeJobsCount: 1,
    applications: [
      {
        status: "reviewed",
        created_at: "2026-05-18T09:00:00.000Z",
        updated_at: "2026-05-20T21:00:00.000Z",
      },
    ],
    now: new Date("2026-05-23T09:00:00.000Z"),
  });

  assert.equal(result.responseBadge, "Moderate response time");
  assert.equal(result.responseLabel, "Moderate response time");
  assert.equal(result.responseVariant, "warning");
  assert.equal(result.averageResponseHours, 60);
});

test("deriveEmployerTrustSignals handles expectedResponseDays of 1 day singular", () => {
  const result = deriveEmployerTrustSignals({
    activeJobsCount: 0,
    applications: [],
    expectedResponseDays: 1,
    now: new Date("2026-05-23T09:00:00.000Z"),
  });

  assert.equal(result.responseDetail, "Expected within 1 day");
});

test("deriveEmployerTrustSignals ignores expectedResponseDays when zero or null", () => {
  const result = deriveEmployerTrustSignals({
    activeJobsCount: 0,
    applications: [],
    expectedResponseDays: 0,
    now: new Date("2026-05-23T09:00:00.000Z"),
  });

  assert.equal(result.responseBadge, "No response data");
  assert.equal(result.responseLabel, "No response history yet");
  assert.equal(result.responseVariant, "outline");
});

test("deriveEmployerTrustSignals counts only stale new applications", () => {
  const result = deriveEmployerTrustSignals({
    activeJobsCount: 1,
    applications: [
      {
        status: "new",
        created_at: "2026-05-20T09:00:00.000Z",
        updated_at: "2026-05-20T09:00:00.000Z",
      },
      {
        status: "new",
        created_at: "2026-05-10T09:00:00.000Z",
        updated_at: "2026-05-10T09:00:00.000Z",
      },
      {
        status: "reviewed",
        created_at: "2026-05-01T09:00:00.000Z",
        updated_at: "2026-05-15T09:00:00.000Z",
      },
    ],
    now: new Date("2026-05-23T09:00:00.000Z"),
  });

  assert.equal(result.staleNewApplications, 1);
  assert.equal(result.responseBadge, "Moderate response time");
});
