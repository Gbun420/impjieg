import test from "node:test";
import assert from "node:assert/strict";
import { normalizeApplicationScorecardData } from "./application-scorecard";

test("normalizeApplicationScorecardData preserves cached match summaries", () => {
  const result = normalizeApplicationScorecardData({
    score: 87,
    matchLevel: "Excellent",
    strengths: ["Strong React skills", "Malta-based"],
    gaps: ["Senior leadership"],
    skillMatch: {
      matching: ["React"],
      missing: ["Leadership"],
      bonus: ["TypeScript"],
    },
    recommendation: "Strong match - move forward",
  });

  assert.deepEqual(result, {
    score: 87,
    matchLevel: "Excellent",
    strengths: ["Strong React skills", "Malta-based"],
    gaps: ["Senior leadership"],
    skillMatch: {
      matching: ["React"],
      missing: ["Leadership"],
      bonus: ["TypeScript"],
    },
    recommendation: "Strong match - move forward",
  });
});

test("normalizeApplicationScorecardData returns null for incomplete data", () => {
  assert.equal(
    normalizeApplicationScorecardData({
      score: 87,
      matchLevel: "Excellent",
      strengths: ["Strong React skills"],
      gaps: [],
      skillMatch: {
        matching: [],
        missing: [],
        bonus: [],
      },
    } as never),
    null
  );
});
