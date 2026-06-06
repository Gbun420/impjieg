import test from "node:test";
import assert from "node:assert/strict";
import {
  candidatePortalNavGroups,
  employerPortalNavGroups,
} from "./portal-navigation";

test("candidate portal nav is grouped cleanly", () => {
  assert.deepEqual(
    candidatePortalNavGroups.map((group) => group.label),
    ["Overview", "Profile", "Activity", "Jobs"]
  );
  assert.deepEqual(
    candidatePortalNavGroups[2].items.map((item) => item.label),
    ["Applications", "Job Alerts", "Saved Jobs"]
  );
});

test("employer portal nav is grouped cleanly", () => {
  assert.deepEqual(
    employerPortalNavGroups.map((group) => group.label),
    ["Overview", "Hiring", "Growth", "Account"]
  );
  assert.deepEqual(
    employerPortalNavGroups[1].items.map((item) => item.label),
    ["My Jobs", "Post a Job", "Applications", "Bulk Upload"]
  );
});
