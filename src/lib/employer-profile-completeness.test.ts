import test from "node:test";
import assert from "node:assert/strict";
import { deriveEmployerProfileCompleteness } from "./employer-profile-completeness";

test("deriveEmployerProfileCompleteness rewards richer employer brand content", () => {
  const result = deriveEmployerProfileCompleteness({
    description: "We build software for regulated industries.",
    website: "https://example.com",
    logo_url: "https://example.com/logo.png",
    cover_image_url: "https://example.com/cover.png",
    company_size: "11-50",
    industry: "Technology",
    culture_summary: "Small team, strong ownership, calm processes.",
    hiring_process: "Intro call, technical interview, final decision within one week.",
    workplace_highlights: ["Remote-friendly", "Learning budget", "Health insurance"],
    response_time_days: 5,
  });

  assert.equal(result.level, "high");
  assert.equal(result.missing.length, 0);
});

test("deriveEmployerProfileCompleteness points out missing trust-building fields", () => {
  const result = deriveEmployerProfileCompleteness({
    description: null,
    website: null,
    logo_url: null,
    cover_image_url: null,
    company_size: null,
    industry: null,
    culture_summary: null,
    hiring_process: null,
    workplace_highlights: [],
    response_time_days: null,
  });

  assert.equal(result.level, "low");
  assert.match(result.missing.join(" "), /company description/i);
  assert.match(result.missing.join(" "), /hiring process/i);
  assert.match(result.missing.join(" "), /response time/i);
});
