import test from "node:test";
import assert from "node:assert/strict";
import {
  applyCandidateJobFilters,
  resolvePostLoginDestination,
} from "./candidate-queries";

test("applyCandidateJobFilters uses scalar-compatible filters", () => {
  const calls: Array<{ method: string; args: unknown[] }> = [];
  const query = {
    in(...args: unknown[]) {
      calls.push({ method: "in", args });
      return this;
    },
    eq(...args: unknown[]) {
      calls.push({ method: "eq", args });
      return this;
    },
    gte(...args: unknown[]) {
      calls.push({ method: "gte", args });
      return this;
    },
  };

  applyCandidateJobFilters(query, {
    sectors: ["Technology", "Finance"],
    job_types: ["Full-time"],
    remote_preference: "Hybrid",
    desired_salary_min: 50000,
  });

  assert.deepEqual(calls, [
    { method: "in", args: ["sector", ["Technology", "Finance"]] },
    { method: "in", args: ["job_type", ["Full-time"]] },
    { method: "eq", args: ["remote_type", "Hybrid"] },
    { method: "gte", args: ["salary_max", 50000] },
  ]);
});

test("resolvePostLoginDestination prefers explicit redirects", () => {
  assert.equal(
    resolvePostLoginDestination({
      redirectUrl: "/candidate/recommendations",
      isAdmin: false,
      hasEmployerProfile: true,
    }),
    "/candidate/recommendations"
  );
});

test("resolvePostLoginDestination falls back to candidate dashboard when no employer profile exists", () => {
  assert.equal(
    resolvePostLoginDestination({
      redirectUrl: null,
      isAdmin: false,
      hasEmployerProfile: false,
    }),
    "/candidate/dashboard"
  );
});

test("resolvePostLoginDestination falls back to admin dashboard for super admins", () => {
  assert.equal(
    resolvePostLoginDestination({
      redirectUrl: null,
      isAdmin: true,
      hasEmployerProfile: false,
    }),
    "/admin/dashboard"
  );
});
