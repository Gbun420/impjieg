import type { AIJobMatchAnalysis } from "@/lib/ai-match.service";
import type { Json } from "@/lib/supabase/types";

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function normalizeApplicationScorecardData(
  value: Json | null
): AIJobMatchAnalysis | null {
  if (!isObject(value)) {
    return null;
  }

  const score = value.score;
  const matchLevel = value.matchLevel;
  const strengths = value.strengths;
  const gaps = value.gaps;
  const skillMatch = value.skillMatch;
  const recommendation = value.recommendation;

  if (
    typeof score !== "number" ||
    typeof matchLevel !== "string" ||
    !isStringArray(strengths) ||
    !isStringArray(gaps) ||
    !isObject(skillMatch) ||
    !isStringArray(skillMatch.matching) ||
    !isStringArray(skillMatch.missing) ||
    !isStringArray(skillMatch.bonus) ||
    typeof recommendation !== "string"
  ) {
    return null;
  }

  return {
    score,
    matchLevel,
    strengths,
    gaps,
    skillMatch: {
      matching: skillMatch.matching,
      missing: skillMatch.missing,
      bonus: skillMatch.bonus,
    },
    recommendation,
  };
}
