import test from "node:test";
import assert from "node:assert/strict";
import {
  DEMO_ALERTS,
  DEMO_APPLICATIONS,
  DEMO_CANDIDATE_APPLICATIONS,
  DEMO_CANDIDATES,
  DEMO_EMPLOYERS,
  DEMO_JOBS,
  DEMO_PAYMENTS,
  DEMO_SAVED_JOBS,
  DEMO_USERS,
  stableUuid,
} from "./demo-fixtures";

function unique(values: string[]) {
  return new Set(values).size === values.length;
}

test("demo fixtures stay internally consistent", () => {
  assert.equal(unique(DEMO_USERS.map((item) => item.email)), true);
  assert.equal(unique(DEMO_EMPLOYERS.map((item) => item.slug)), true);
  assert.equal(unique(DEMO_CANDIDATES.map((item) => item.profile.full_name)), true);
  assert.equal(unique(DEMO_JOBS.map((item) => item.slug)), true);
  assert.equal(unique(DEMO_ALERTS.map((item) => item.email)), true);

  const employerKeys = new Set(DEMO_EMPLOYERS.map((item) => item.key));
  const candidateKeys = new Set(DEMO_CANDIDATES.map((item) => item.key));
  const jobKeys = new Set(DEMO_JOBS.map((item) => item.key));
  const applicationKeys = new Set(DEMO_APPLICATIONS.map((item) => item.key));

  assert.equal(DEMO_JOBS.every((job) => employerKeys.has(job.employerKey)), true);
  assert.equal(DEMO_APPLICATIONS.every((app) => jobKeys.has(app.jobKey)), true);
  assert.equal(DEMO_CANDIDATE_APPLICATIONS.every((item) => candidateKeys.has(item.candidateKey)), true);
  assert.equal(DEMO_SAVED_JOBS.every((item) => candidateKeys.has(item.candidateKey)), true);
  assert.equal(DEMO_PAYMENTS.every((item) => employerKeys.has(item.employerKey)), true);

  assert.equal(applicationKeys.has("application-omar-devops"), true);
  assert.equal(stableUuid("employer:azure-crest-gaming").length, 36);
});
