import test from "node:test";
import assert from "node:assert/strict";
import { filterApplications } from "./application-filters";

const applications = [
  {
    id: "1",
    status: "new",
    created_at: "2026-05-19T09:00:00.000Z",
    candidate_name: "Alice Smith",
    candidate_email: "alice@example.com",
    jobs: { title: "Backend Engineer" },
  },
  {
    id: "2",
    status: "reviewed",
    created_at: "2026-05-23T09:00:00.000Z",
    candidate_name: "Bob Jones",
    candidate_email: "bob@example.com",
    jobs: { title: "Frontend Engineer" },
  },
];

test("filterApplications matches candidate and job text search", () => {
  const result = filterApplications(applications, {
    search: "frontend",
    attentionOnly: false,
  });

  assert.equal(result.length, 1);
  assert.equal(result[0]?.id, "2");
});

test("filterApplications returns only stale new applications in attention mode", () => {
  const result = filterApplications(
    applications,
    {
      search: "",
      attentionOnly: true,
    },
    new Date("2026-05-23T12:00:00.000Z")
  );

  assert.equal(result.length, 1);
  assert.equal(result[0]?.id, "1");
});
