import test from "node:test";
import assert from "node:assert/strict";

import { escapeXml } from "./jobs/rss/route";
import {
  candidateAlertInputSchema,
  candidateAlertUpdateSchema,
} from "./candidate/alerts/route";

test("escapeXml preserves XML safety for feed content", () => {
  const input = `Senior <Engineer> & "Builder" 'Lead'`;

  assert.equal(
    escapeXml(input),
    "Senior &lt;Engineer&gt; &amp; &quot;Builder&quot; &apos;Lead&apos;"
  );
});

test("candidate alert create schema normalizes empty values", () => {
  const parsed = candidateAlertInputSchema.parse({
    name: "  ",
    sectors: ["Technology", " "],
    job_types: ["Full-time"],
    locations: [],
    salary_min: "35000",
    remote_type: "",
    frequency: "weekly",
    is_active: true,
  });

  assert.equal(parsed.name, null);
  assert.deepEqual(parsed.sectors, ["Technology", ""]);
  assert.equal(parsed.salary_min, 35000);
  assert.equal(parsed.remote_type, null);
  assert.equal(parsed.frequency, "weekly");
});

test("candidate alert update schema accepts partial toggle payloads", () => {
  const parsed = candidateAlertUpdateSchema.parse({
    is_active: false,
  });

  assert.deepEqual(parsed, { is_active: false });
});
