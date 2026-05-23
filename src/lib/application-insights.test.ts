import test from "node:test";
import assert from "node:assert/strict";
import { deriveApplicationInsights } from "./application-insights";

test("deriveApplicationInsights computes review backlog and response speed", () => {
  const insights = deriveApplicationInsights(
    [
      {
        status: "new",
        created_at: "2026-05-18T09:00:00.000Z",
        updated_at: "2026-05-18T09:00:00.000Z",
      },
      {
        status: "reviewed",
        created_at: "2026-05-20T09:00:00.000Z",
        updated_at: "2026-05-21T09:00:00.000Z",
      },
      {
        status: "shortlisted",
        created_at: "2026-05-21T09:00:00.000Z",
        updated_at: "2026-05-21T21:00:00.000Z",
      },
    ],
    new Date("2026-05-23T09:00:00.000Z")
  );

  assert.equal(insights.newApplications, 1);
  assert.equal(insights.staleNewApplications, 1);
  assert.equal(insights.respondedApplications, 2);
  assert.equal(insights.averageFirstActionHours, 18);
});
