export type PermitFitInput = {
  roleTitle?: string;
  sector?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  tcnSupportLevel: string;
  permitRoutesSupported: string[];
  requiresCandidateInMalta: boolean;
  supportsAccommodation: boolean;
  supportsRelocation: boolean;
  supportsPreDepartureCourse: boolean;
  candidateWorkStatus: string;
  candidateCurrentCountry?: string;
  candidateAlreadyInMalta: boolean;
  candidateHasMalteseResidenceCard: boolean;
  candidateNeedsChangeOfEmployer: boolean;
  candidatePermitExpiryDate?: string | null;
  candidatePreDepartureCourseStatus: string;
  candidateEarliestStartDate?: string | null;
  candidateNeedsAccommodation: boolean;
  candidateNeedsRelocation: boolean;
};

export type PermitFitResult = {
  score: number | null;
  label:
    | "Strong permit fit"
    | "Possible permit fit"
    | "Permit risk"
    | "Not enough information";
  summary: string;
  positiveSignals: string[];
  riskSignals: string[];
  nextQuestions: string[];
};

export function calculatePermitFit(input: PermitFitInput): PermitFitResult {
  let score: number | null = null;
  let label: PermitFitResult["label"] = "Not enough information";
  let summary = "";
  const positiveSignals: string[] = [];
  const riskSignals: string[] = [];
  const nextQuestions: string[] = [];

  // A. Unknown / missing candidate status
  if (!input.candidateWorkStatus || input.candidateWorkStatus === "unknown") {
    label = "Not enough information";
    score = null;
    summary =
      "More candidate work-status information is needed before this role can be assessed.";
    riskSignals.push("Candidate work status is not clear.");
    nextQuestions.push(
      "What is the candidate’s current work status in Malta or abroad?"
    );
    nextQuestions.push(
      "Can the candidate provide their current start-date context?"
    );

    return {
      score,
      label,
      summary,
      positiveSignals,
      riskSignals,
      nextQuestions,
    };
  }

  // B. Maltese / EU candidate
  if (input.candidateWorkStatus === "maltese_or_eu") {
    score = 90;
    summary =
      "The candidate does not appear to require the TCN support signals used in this assessment.";
    positiveSignals.push("Candidate is marked as Maltese / EU.");
    nextQuestions.push(
      "Confirm normal right-to-work documentation during the employer’s hiring process."
    );
  } else {
    // TCN Candidate Logic
    const isTcnInMaltaWithValidPermit =
      input.candidateWorkStatus === "tcn_in_malta_with_valid_permit";
    const isTcnNeedsChangeOfEmployer =
      input.candidateWorkStatus === "tcn_in_malta_needs_change_of_employer" ||
      input.candidateNeedsChangeOfEmployer;
    const isTcnOutsideNeedsFirstTime =
      input.candidateWorkStatus === "tcn_outside_malta_needs_first_time_permit";

    // C. TCN with no employer support
    if (
      input.tcnSupportLevel === "none" &&
      (!input.permitRoutesSupported || input.permitRoutesSupported.length === 0)
    ) {
      score = 25;
      summary =
        "The role does not show employer-declared TCN support for this candidate route.";
      riskSignals.push("Employer has not declared TCN support.");
      nextQuestions.push("Can the employer support this candidate route?");
      nextQuestions.push(
        "Is the candidate already in Malta with a status that allows a realistic start?"
      );
    }
    // D. TCN in Malta with valid permit
    else if (isTcnInMaltaWithValidPermit) {
      if (input.candidateAlreadyInMalta) {
        positiveSignals.push("Candidate indicates they are already in Malta.");
        if (input.requiresCandidateInMalta) {
          positiveSignals.push(
            "Role requires candidate in Malta, and candidate matches."
          );
        }
      }
      if (input.candidateHasMalteseResidenceCard) {
        positiveSignals.push(
          "Candidate indicates they hold a Maltese residence card."
        );
      }

      if (
        [
          "already_in_malta_only",
          "change_of_employer_supported",
          "first_time_single_permit_supported",
          "full_relocation_supported",
        ].includes(input.tcnSupportLevel)
      ) {
        score = 85;
        summary =
          "The employer supports TCNs already in Malta, and the candidate indicates a valid permit.";
      } else {
        score = 65;
        summary =
          "Candidate is in Malta with a permit, but employer support level is not perfectly aligned.";
      }
    }
    // E. TCN needing change of employer
    else if (isTcnNeedsChangeOfEmployer) {
      const supportsChangeOfEmployer =
        input.tcnSupportLevel === "change_of_employer_supported" ||
        input.tcnSupportLevel === "full_relocation_supported" ||
        (input.permitRoutesSupported &&
          input.permitRoutesSupported.includes("change_of_employer"));

      if (supportsChangeOfEmployer) {
        positiveSignals.push(
          "Employer supports change of employer applications."
        );
        score = 80;
        summary =
          "The employer supports change of employer, matching the candidate's needs.";
      } else {
        riskSignals.push(
          "Candidate needs a change of employer, but role does not explicitly support it."
        );
        score = 40;
        summary =
          "The employer has not explicitly indicated support for change of employer applications.";
      }
    }
    // F. TCN outside Malta needing first-time permit
    else if (isTcnOutsideNeedsFirstTime) {
      const supportsFirstTime =
        input.tcnSupportLevel === "first_time_single_permit_supported" ||
        input.tcnSupportLevel === "full_relocation_supported" ||
        (input.permitRoutesSupported &&
          input.permitRoutesSupported.includes("single_permit"));

      if (supportsFirstTime) {
        score = 70;
        summary =
          "Employer supports first-time permits, but start-date risk remains a factor for outside-Malta candidates.";
        nextQuestions.push(
          "What is the realistic timeline for permit processing from this candidate's location?"
        );
      } else {
        score = 30;
        summary =
          "Candidate requires a first-time permit from outside Malta, but the role does not explicitly support this route.";
        riskSignals.push(
          "Role does not explicitly support first-time Single Permits from outside Malta."
        );
      }
    } else {
      // Fallback for other TCN statuses e.g., student
      score = 50;
      summary =
        "Candidate has an alternative status (e.g., student). Further investigation needed.";
    }
  }

  // Global Modifiers (Applied to all assessed profiles)
  // G. Accommodation
  if (input.candidateNeedsAccommodation && input.supportsAccommodation) {
    positiveSignals.push(
      "Employer supports accommodation, matching candidate needs."
    );
  } else if (
    input.candidateNeedsAccommodation &&
    !input.supportsAccommodation
  ) {
    riskSignals.push(
      "Candidate needs accommodation, but role does not provide it."
    );
    if (score !== null) score -= 15;
  }

  // H. Relocation
  if (input.candidateNeedsRelocation && input.supportsRelocation) {
    positiveSignals.push(
      "Employer supports relocation, matching candidate needs."
    );
  } else if (input.candidateNeedsRelocation && !input.supportsRelocation) {
    riskSignals.push(
      "Candidate needs relocation, but role does not provide it."
    );
    if (score !== null) score -= 15;
  }

  // I. Pre-departure course
  const isFirstTimeRoute =
    input.candidateWorkStatus === "tcn_outside_malta_needs_first_time_permit";
  if (isFirstTimeRoute) {
    if (input.candidatePreDepartureCourseStatus === "completed") {
      positiveSignals.push(
        "Candidate has completed the required pre-departure course."
      );
    } else if (
      ["not_started", "not_required_or_unknown"].includes(
        input.candidatePreDepartureCourseStatus
      )
    ) {
      riskSignals.push(
        "Pre-departure course may be required but is not started or status is unknown."
      );
      if (score !== null) score -= 15;
    }
  }
  if (input.supportsPreDepartureCourse) {
    positiveSignals.push(
      "Employer offers support for the pre-departure course."
    );
  }

  // J. KEI / SEI salary route signals
  if (
    input.permitRoutesSupported &&
    input.permitRoutesSupported.includes("kei")
  ) {
    const maxS = input.salaryMax;
    const minS = input.salaryMin;
    if ((maxS != null && maxS < 45000) || (maxS == null && minS != null && minS < 45000)) {
      riskSignals.push(
        "Salary entered may not support the selected high-skill route based on the information provided."
      );
    }
  }
  if (
    input.permitRoutesSupported &&
    input.permitRoutesSupported.includes("sei")
  ) {
    const maxS = input.salaryMax;
    const minS = input.salaryMin;
    if ((maxS != null && maxS < 30000) || (maxS == null && minS != null && minS < 30000)) {
      riskSignals.push(
        "Salary entered may not support the selected specialist route based on the information provided."
      );
    }
  }

  // K. Tourism & Hospitality
  if (input.sector === "Tourism & Hospitality") {
    nextQuestions.push(
      "Does this candidate also require sector-specific Skills Pass steps?"
    );
  }

  // L. Score boundaries and Label mapping
  if (score !== null) {
    score = Math.max(0, Math.min(100, score));

    if (score >= 80) {
      label = "Strong permit fit";
    } else if (score >= 50) {
      label = "Possible permit fit";
    } else {
      label = "Permit risk";
    }
  } else {
    label = "Not enough information";
  }

  return {
    score,
    label,
    summary,
    positiveSignals,
    riskSignals,
    nextQuestions,
  };
}
