import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { checkEligibility, THRESHOLDS, type CheckerInput } from "./eligibility";

function input(overrides: Partial<CheckerInput> = {}): CheckerInput {
  return {
    nationality: "non-eu",
    hasOffer: true,
    grossAnnual: 50000,
    roleType: "managerial-technical",
    ...overrides,
  };
}

describe("checkEligibility — EU/EEA/Swiss", () => {
  it("needs no permit and returns no pathways", () => {
    const r = checkEligibility(input({ nationality: "eu" }));
    assert.equal(r.needsPermit, false);
    assert.equal(r.pathways.length, 0);
    assert.equal(r.recommendedId, null);
    assert.match(r.headline, /don't need a work permit/i);
  });
});

describe("checkEligibility — non-EU without an offer", () => {
  it("tells the user to get an offer first, with no pathways yet", () => {
    const r = checkEligibility(input({ hasOffer: false }));
    assert.equal(r.needsPermit, true);
    assert.equal(r.pathways.length, 0);
    assert.equal(r.recommendedId, null);
    assert.match(r.headline, /job offer/i);
  });
});

describe("checkEligibility — non-EU with an offer", () => {
  it("recommends KEI for a managerial/technical role at/above the threshold", () => {
    const r = checkEligibility(input({ roleType: "managerial-technical", grossAnnual: THRESHOLDS.kei }));
    assert.equal(r.recommendedId, "kei");
    assert.equal(r.pathways[0].id, "kei");
    assert.equal(r.pathways[0].eligible, true);
  });

  it("does not recommend KEI below the KEI threshold", () => {
    const r = checkEligibility(input({ roleType: "managerial-technical", grossAnnual: THRESHOLDS.kei - 1 }));
    assert.notEqual(r.recommendedId, "kei");
  });

  it("recommends the Blue Card for a highly-qualified role above its threshold (non-managerial)", () => {
    const r = checkEligibility(input({ roleType: "highly-qualified", grossAnnual: THRESHOLDS.blueCard }));
    assert.equal(r.recommendedId, "blue-card");
  });

  it("recommends SEI for an other-skilled role at/above €30k", () => {
    const r = checkEligibility(input({ roleType: "other-skilled", grossAnnual: THRESHOLDS.sei }));
    assert.equal(r.recommendedId, "sei");
  });

  it("falls back to the standard Single Permit below all fast-track thresholds", () => {
    const r = checkEligibility(input({ roleType: "other-skilled", grossAnnual: 24000 }));
    assert.equal(r.recommendedId, "single-permit");
  });

  it("always includes an eligible standard Single Permit and recommends first", () => {
    const r = checkEligibility(input());
    const single = r.pathways.find((p) => p.id === "single-permit");
    assert.ok(single?.eligible, "single permit should always be available");
    assert.equal(r.pathways[0].id, r.recommendedId);
    assert.equal(r.pathways.length, 4);
  });
});
