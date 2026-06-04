import test from "node:test";
import assert from "node:assert/strict";
import {
  adminConsoleNavItems,
  getAdminConsoleSectionMeta,
  resolveAdminConsoleSection,
} from "./admin-consoles";

test("admin console nav includes the wired live consoles", () => {
  assert.deepEqual(
    adminConsoleNavItems.map((item) => item.label),
    [
      "Overview",
      "Jobs",
      "Employers",
      "Candidates",
      "Applications",
      "Payments",
      "Alerts",
      "Subscriptions",
      "Audit log",
    ]
  );
});

test("admin console section resolver maps known console slugs", () => {
  assert.equal(resolveAdminConsoleSection(["jobs"]), "jobs");
  assert.equal(resolveAdminConsoleSection(["audit-log"]), "audit-log");
  assert.equal(resolveAdminConsoleSection(["unknown"]), null);
  assert.equal(resolveAdminConsoleSection([]), null);
});

test("admin console metadata stays aligned with the live consoles", () => {
  const jobsMeta = getAdminConsoleSectionMeta("jobs");
  assert.equal(jobsMeta.title, "Jobs operations");
  assert.match(jobsMeta.description, /Review live listings/i);
});
