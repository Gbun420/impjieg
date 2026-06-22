/**
 * Malta work-permit eligibility logic for the interactive checker.
 *
 * ⚠️ APPROXIMATE GUIDANCE ONLY — not legal or immigration advice. Maltese
 * immigration rules, salary thresholds, fees, and processing times change
 * frequently. Always confirm the current requirements with the official
 * sources (Identità, Jobsplus) before relying on any figure or timeline.
 *
 * Sources: Identità (identita.gov.mt), Jobsplus (jobsplus.gov.mt).
 */

export type Nationality = "eu" | "non-eu";
export type RoleType = "managerial-technical" | "highly-qualified" | "other-skilled";

export interface CheckerInput {
  nationality: Nationality;
  hasOffer: boolean;
  grossAnnual: number;
  roleType: RoleType;
}

export interface Pathway {
  id: string;
  name: string;
  summary: string;
  /** Whether the inputs meet this route's headline criteria. */
  eligible: boolean;
  requirements: string[];
  timeline: string;
  fee: string;
  officialUrl: string;
}

export interface EligibilityResult {
  headline: string;
  detail: string;
  needsPermit: boolean;
  /** Recommended-first list of routes (empty for EU/EEA/Swiss). */
  pathways: Pathway[];
  recommendedId: string | null;
  nextSteps: string[];
}

/** Approximate 2026 gross annual salary thresholds (€). Verify with Identità. */
export const THRESHOLDS = {
  kei: 45000,
  blueCard: 38600,
  sei: 30000,
} as const;

const IDENTITA = "https://identita.gov.mt";

export function checkEligibility(input: CheckerInput): EligibilityResult {
  if (input.nationality === "eu") {
    return {
      headline: "You don't need a work permit",
      detail:
        "As an EU, EEA, or Swiss citizen you have the right to work in Malta. If you stay longer than three months, register for an eResidence document with Identità — an administrative formality, not a barrier.",
      needsPermit: false,
      pathways: [],
      recommendedId: null,
      nextSteps: [
        "Find a job and accept an offer",
        "Your employer registers your employment with Jobsplus",
        "Apply for an eResidence document if staying 3+ months (Identità)",
        "Get a National Insurance (NI) number",
      ],
    };
  }

  // Non-EU (third-country national)
  if (!input.hasOffer) {
    return {
      headline: "Secure a job offer first",
      detail:
        "Non-EU nationals can't apply on their own — you need a confirmed job offer, and your Maltese employer submits the Single Permit application on your behalf. So your job search comes first.",
      needsPermit: true,
      pathways: [],
      recommendedId: null,
      nextSteps: [
        "Browse jobs in Malta and apply",
        "Set a free job alert so new roles reach you first",
        "Once you have an offer, your employer starts the Single Permit application",
      ],
    };
  }

  const { grossAnnual, roleType } = input;

  const pathways: Pathway[] = [
    {
      id: "kei",
      name: "Key Employee Initiative (KEI)",
      summary: "Accelerated Single Permit for managerial or highly technical roles.",
      eligible: roleType === "managerial-technical" && grossAnnual >= THRESHOLDS.kei,
      requirements: [
        "Managerial or highly technical role",
        "Gross salary of at least €45,000",
        "Relevant qualifications or proven experience",
        "A confirmed job offer from a Malta-licensed employer",
      ],
      timeline: "Fast-tracked — often a matter of working days",
      fee: "~€600 (standard Single Permit fees apply)",
      officialUrl: IDENTITA,
    },
    {
      id: "blue-card",
      name: "EU Blue Card",
      summary: "For highly qualified workers with a degree-level qualification.",
      eligible: roleType !== "other-skilled" && grossAnnual >= THRESHOLDS.blueCard,
      requirements: [
        "Higher / degree-level qualification",
        "Gross salary around €38,600 or above (≈1.5× the national average)",
        "A confirmed job offer, usually for 12 months or more",
      ],
      timeline: "Several weeks to a few months",
      fee: "~€600",
      officialUrl: IDENTITA,
    },
    {
      id: "sei",
      name: "Specialist Employee Initiative (SEI)",
      summary: "For skilled workers who don't qualify for the KEI fast-track.",
      eligible: grossAnnual >= THRESHOLDS.sei,
      requirements: [
        "A skilled role with the required qualifications or experience",
        "Gross salary of at least €30,000",
        "A confirmed job offer from a Malta-licensed employer",
      ],
      timeline: "Typically up to around three months",
      fee: "~€600",
      officialUrl: IDENTITA,
    },
    {
      id: "single-permit",
      name: "Single Permit (standard)",
      summary: "The standard combined work-and-residence permit, available for any eligible role.",
      eligible: true,
      requirements: [
        "A confirmed job offer from a Malta-licensed employer",
        "The role is advertised via Jobsplus / EURES (labour-market test)",
        "Pre-departure course for first-time applicants (from 2026)",
        "Health insurance, accommodation, police conduct certificate, recognised qualifications",
      ],
      timeline: "Typically up to around four months end-to-end",
      fee: "~€600 new · ~€150 annual renewal",
      officialUrl: IDENTITA,
    },
  ];

  // Recommend the best eligible fast-track, in order of preference.
  const preference = ["kei", "blue-card", "sei", "single-permit"];
  const recommendedId =
    preference.find((id) => pathways.find((p) => p.id === id)?.eligible) ?? "single-permit";

  const recommended = pathways.find((p) => p.id === recommendedId)!;
  const isFastTrack = recommendedId !== "single-permit";

  return {
    headline: isFastTrack ? `You may qualify for the ${recommended.name}` : "You'll need a standard Single Permit",
    detail: isFastTrack
      ? `Based on your role and salary, the ${recommended.name} looks like the most likely route — ${recommended.summary.toLowerCase()} Your employer applies on your behalf through Identità.`
      : "Your role and salary point to the standard Single Permit. Your employer applies on your behalf through Identità, and the role is usually advertised first as a labour-market test.",
    needsPermit: true,
    // Recommended first, then the other routes.
    pathways: [recommended, ...pathways.filter((p) => p.id !== recommendedId)],
    recommendedId,
    nextSteps: [
      "Confirm your job offer and contract with the employer",
      "Your employer starts the application on the Single Permit portal",
      "Gather documents early (qualifications recognition, police conduct, accommodation)",
      "Complete the pre-departure course if you're a first-time applicant",
    ],
  };
}
