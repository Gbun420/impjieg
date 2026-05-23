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
  assert.equal(result.hasFreshJobs, false);
  assert.equal(result.staleNewApplications, 1);
});
