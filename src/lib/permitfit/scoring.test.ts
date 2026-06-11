import test from "node:test";
import assert from "node:assert";
import { calculatePermitFit, PermitFitInput } from "./scoring.js";

const DEFAULT_INPUT: PermitFitInput = {
  tcnSupportLevel: "none",
  permitRoutesSupported: [],
  requiresCandidateInMalta: false,
  supportsAccommodation: false,
  supportsRelocation: false,
  supportsPreDepartureCourse: false,
  candidateWorkStatus: "unknown",
  candidateAlreadyInMalta: false,
  candidateHasMalteseResidenceCard: false,
  candidateNeedsChangeOfEmployer: false,
  candidatePreDepartureCourseStatus: "not_required_or_unknown",
  candidateNeedsAccommodation: false,
  candidateNeedsRelocation: false,
};

function getTestInput(overrides: Partial<PermitFitInput> = {}): PermitFitInput {
  return { ...DEFAULT_INPUT, ...overrides };
}

test("1. unknown work status returns Not enough information", () => {
  const result = calculatePermitFit(getTestInput({ candidateWorkStatus: "unknown" }));
  assert.strictEqual(result.label, "Not enough information");
  assert.strictEqual(result.score, null);
});

test("2. Maltese/EU candidate returns Strong permit fit", () => {
  const result = calculatePermitFit(getTestInput({ candidateWorkStatus: "maltese_or_eu" }));
  assert.strictEqual(result.label, "Strong permit fit");
  assert.strictEqual(result.score, 90);
});

test("3. TCN candidate with no employer support returns Permit risk", () => {
  const result = calculatePermitFit(
    getTestInput({
      candidateWorkStatus: "tcn_outside_malta_needs_first_time_permit",
      tcnSupportLevel: "none",
    })
  );
  assert.strictEqual(result.label, "Permit risk");
});

test("4. TCN in Malta needing change of employer with matching employer support returns Possible or Strong permit fit", () => {
  const result = calculatePermitFit(
    getTestInput({
      candidateWorkStatus: "tcn_in_malta_needs_change_of_employer",
      tcnSupportLevel: "change_of_employer_supported",
    })
  );
  assert.ok(["Possible permit fit", "Strong permit fit"].includes(result.label));
});

test("5. TCN outside Malta needing first-time permit with first-time support returns Possible permit fit", () => {
  const result = calculatePermitFit(
    getTestInput({
      candidateWorkStatus: "tcn_outside_malta_needs_first_time_permit",
      tcnSupportLevel: "first_time_single_permit_supported",
    })
  );
  assert.strictEqual(result.label, "Possible permit fit");
});

test("6. accommodation match adds positive signal", () => {
  const result = calculatePermitFit(
    getTestInput({
      candidateWorkStatus: "tcn_outside_malta_needs_first_time_permit",
      candidateNeedsAccommodation: true,
      supportsAccommodation: true,
    })
  );
  const hasMatch = result.positiveSignals.some((s) => s.includes("accommodation"));
  assert.ok(hasMatch);
});

test("7. accommodation mismatch adds risk signal", () => {
  const result = calculatePermitFit(
    getTestInput({
      candidateWorkStatus: "tcn_outside_malta_needs_first_time_permit",
      candidateNeedsAccommodation: true,
      supportsAccommodation: false,
    })
  );
  const hasMismatch = result.riskSignals.some((s) => s.includes("accommodation"));
  assert.ok(hasMismatch);
});

test("8. relocation match adds positive signal", () => {
  const result = calculatePermitFit(
    getTestInput({
      candidateWorkStatus: "tcn_outside_malta_needs_first_time_permit",
      candidateNeedsRelocation: true,
      supportsRelocation: true,
    })
  );
  const hasMatch = result.positiveSignals.some((s) => s.includes("relocation"));
  assert.ok(hasMatch);
});

test("9. pre-departure not started on first-time route adds risk signal", () => {
  const result = calculatePermitFit(
    getTestInput({
      candidateWorkStatus: "tcn_outside_malta_needs_first_time_permit",
      candidatePreDepartureCourseStatus: "not_started",
    })
  );
  const hasRisk = result.riskSignals.some((s) => s.includes("Pre-departure"));
  assert.ok(hasRisk);
});

test("10. KEI route with salary below 45000 adds route salary risk signal", () => {
  const result = calculatePermitFit(
    getTestInput({
      candidateWorkStatus: "tcn_outside_malta_needs_first_time_permit",
      permitRoutesSupported: ["kei"],
      salaryMax: 40000,
    })
  );
  const hasRisk = result.riskSignals.some((s) => s.includes("high-skill"));
  assert.ok(hasRisk);
});

test("11. SEI route with salary below 30000 adds route salary risk signal", () => {
  const result = calculatePermitFit(
    getTestInput({
      candidateWorkStatus: "tcn_outside_malta_needs_first_time_permit",
      permitRoutesSupported: ["sei"],
      salaryMax: 25000,
    })
  );
  const hasRisk = result.riskSignals.some((s) => s.includes("specialist"));
  assert.ok(hasRisk);
});

test("12. Tourism & Hospitality sector adds Skills Pass next question", () => {
  const result = calculatePermitFit(
    getTestInput({
      candidateWorkStatus: "tcn_outside_malta_needs_first_time_permit",
      sector: "Tourism & Hospitality",
    })
  );
  const hasQuestion = result.nextQuestions.some((s) => s.includes("Skills Pass"));
  assert.ok(hasQuestion);
});

test("13. score is null or between 0 and 100", () => {
  const result1 = calculatePermitFit(getTestInput({ candidateWorkStatus: "unknown" }));
  assert.strictEqual(result1.score, null);

  const result2 = calculatePermitFit(getTestInput({ candidateWorkStatus: "maltese_or_eu" }));
  assert.ok(result2.score !== null && result2.score >= 0 && result2.score <= 100);

  const result3 = calculatePermitFit(
    getTestInput({
      candidateWorkStatus: "tcn_outside_malta_needs_first_time_permit",
      tcnSupportLevel: "none",
      candidateNeedsAccommodation: true,
      supportsAccommodation: false,
      candidateNeedsRelocation: true,
      supportsRelocation: false,
    })
  );
  assert.ok(result3.score !== null && result3.score >= 0 && result3.score <= 100);
});

test("14. output text never contains forbidden wording", () => {
  const results = [
    calculatePermitFit(getTestInput({ candidateWorkStatus: "unknown" })),
    calculatePermitFit(getTestInput({ candidateWorkStatus: "maltese_or_eu" })),
    calculatePermitFit(
      getTestInput({
        candidateWorkStatus: "tcn_outside_malta_needs_first_time_permit",
        tcnSupportLevel: "none",
      })
    ),
    calculatePermitFit(
      getTestInput({
        candidateWorkStatus: "tcn_in_malta_needs_change_of_employer",
        tcnSupportLevel: "change_of_employer_supported",
      })
    ),
    calculatePermitFit(
      getTestInput({
        candidateWorkStatus: "tcn_outside_malta_needs_first_time_permit",
        tcnSupportLevel: "first_time_single_permit_supported",
      })
    ),
  ];

  const forbiddenWords = [
    "approved",
    "guaranteed",
    "eligible",
    "government-approved",
    "officially compliant",
    "visa approved",
    "permit approved",
  ];

  for (const result of results) {
    const textToCheck = [
      result.label,
      result.summary,
      ...result.positiveSignals,
      ...result.riskSignals,
      ...result.nextQuestions,
    ].join(" ").toLowerCase();

    for (const word of forbiddenWords) {
      assert.ok(!textToCheck.includes(word), `Found forbidden word: ${word}`);
    }
  }
});
