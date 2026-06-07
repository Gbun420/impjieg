import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  AiSecurityError,
  buildAiRateLimitKey,
  ensureLengthWithinLimit,
  enforceAiRateLimit,
  normalizePromptText,
  readJsonBodyWithLimit,
  type AiAuthenticatedUser,
} from "@/lib/ai-security";

const aiMatchCandidateProfileSchema = z.object({
  fullName: z.string().trim().max(200).optional().nullable(),
  headline: z.string().trim().max(200).optional().nullable(),
  skills: z.array(z.string().trim().max(100)).max(100).optional().default([]),
  experienceYears: z.coerce.number().int().min(0).max(80).optional().default(0),
  sectors: z.array(z.string().trim().max(100)).max(50).optional().default([]),
  jobTypes: z.array(z.string().trim().max(100)).max(20).optional().default([]),
  remotePreference: z.string().trim().max(100).optional().nullable(),
  bio: z.string().trim().max(5000).optional().nullable(),
});

const matchScoreBodySchema = z.object({
  jobTitle: z.string().trim().min(1).max(200),
  jobDescription: z.string().trim().max(8000).optional().nullable().default(""),
  jobSkills: z.array(z.string().trim().max(100)).max(100).optional().default([]),
  jobSector: z.string().trim().max(100).optional().nullable(),
  jobType: z.string().trim().max(100).optional().nullable(),
  jobRemoteType: z.string().trim().max(100).optional().nullable(),
  candidateProfile: aiMatchCandidateProfileSchema,
});

const MAX_MATCH_SCORE_BODY_BYTES = 32_768;
const MAX_MATCH_SCORE_PROMPT_CHARS = 16_000;
const MATCH_SCORE_RATE_LIMIT = 8;
const MATCH_SCORE_RATE_LIMIT_WINDOW_MS = 60_000;

type MatchScoreDeps = {
  getUser: () => Promise<AiAuthenticatedUser | null>;
  fetchImpl: typeof fetch;
  groqApiKey?: string | undefined;
  rateLimit?: {
    limit: number;
    windowMs: number;
  };
};

function buildMatchScoreDeps(): MatchScoreDeps {
  return {
    getUser: async () => {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      return user ? { id: user.id, email: user.email } : null;
    },
    fetchImpl: globalThis.fetch.bind(globalThis),
    groqApiKey: process.env.GROQ_API_KEY,
    rateLimit: {
      limit: MATCH_SCORE_RATE_LIMIT,
      windowMs: MATCH_SCORE_RATE_LIMIT_WINDOW_MS,
    },
  };
}

function buildMatchPrompt(input: z.output<typeof matchScoreBodySchema>) {
  const jobSkills = input.jobSkills.join(", ") || "Not specified";
  const candidateSkills = input.candidateProfile.skills.join(", ") || "Not provided";
  const candidateSectors = input.candidateProfile.sectors.join(", ") || "Not specified";
  const candidateJobTypes = input.candidateProfile.jobTypes.join(", ") || "Not specified";

  return `Analyze how well this candidate profile matches the job posting. Return ONLY valid JSON matching this schema:

{
  "score": "number 0-100 - overall match percentage",
  "matchLevel": "string - 'Excellent' (80+), 'Good' (60-79), 'Fair' (40-59), 'Low' (0-39)",
  "strengths": ["string array - 3-5 reasons why this is a good match"],
  "gaps": ["string array - 2-4 missing skills or qualifications"],
  "skillMatch": {
    "matching": ["string array - skills that match"],
    "missing": ["string array - required skills the candidate lacks"],
    "bonus": ["string array - extra skills the candidate has"]
  },
  "recommendation": "string - 1-2 sentence recommendation for the candidate"
}

Job Details:
- Title: ${input.jobTitle}
- Sector: ${input.jobSector || "Not specified"}
- Type: ${input.jobType || "Not specified"}
- Remote: ${input.jobRemoteType || "Not specified"}
- Skills: ${jobSkills}
- Description: ${input.jobDescription || "Not provided"}

Candidate Profile:
- Name: ${input.candidateProfile.fullName || "Not provided"}
- Headline: ${input.candidateProfile.headline || "Not provided"}
- Skills: ${candidateSkills}
- Experience: ${input.candidateProfile.experienceYears || 0} years
- Sectors: ${candidateSectors}
- Job Types: ${candidateJobTypes}
- Remote Preference: ${input.candidateProfile.remotePreference || "Not specified"}
- Bio: ${input.candidateProfile.bio || "Not provided"}

Scoring guidelines:
- Sector match: +20 points
- Job type match: +15 points  
- Remote preference match: +10 points
- Skill overlap (each matching skill): +5 points (max 30)
- Experience level appropriate: +15 points
- Salary alignment: +10 points

Return ONLY the JSON object, no markdown fences, no explanation.`;
}

async function matchScoreWithDeps(request: Request, deps: MatchScoreDeps) {
  try {
    const user = await deps.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await enforceAiRateLimit({
      key: buildAiRateLimitKey("match-score", user, request),
      limit: deps.rateLimit?.limit ?? MATCH_SCORE_RATE_LIMIT,
      windowMs: deps.rateLimit?.windowMs ?? MATCH_SCORE_RATE_LIMIT_WINDOW_MS,
    });

    const payload = matchScoreBodySchema.safeParse(
      await readJsonBodyWithLimit<Record<string, unknown>>({
        request,
        maxBytes: MAX_MATCH_SCORE_BODY_BYTES,
      })
    );

    if (!payload.success) {
      return NextResponse.json({ error: "Invalid match scoring data" }, { status: 400 });
    }

    const normalizedPayload = payload.data;
    const prompt = buildMatchPrompt(normalizedPayload);
    ensureLengthWithinLimit(
      normalizePromptText(prompt),
      MAX_MATCH_SCORE_PROMPT_CHARS,
      "Match scoring input is too large."
    );

    if (!deps.groqApiKey) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 503 });
    }

    const response = await deps.fetchImpl("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${deps.groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You are an expert recruiter analyzing candidate-job fit. Provide accurate, fair assessments. Always return valid JSON only.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 1024,
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API error:", response.status);
      return NextResponse.json({ error: "Failed to calculate match score" }, { status: 502 });
    }

    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      return NextResponse.json({ error: "Failed to calculate match score" }, { status: 502 });
    }

    let matchAnalysis: unknown;
    try {
      matchAnalysis = JSON.parse(content);
    } catch {
      return NextResponse.json({ error: "Failed to calculate match score" }, { status: 502 });
    }

    return NextResponse.json({ matchAnalysis });
  } catch (error) {
    if (error instanceof AiSecurityError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Match scoring error:", error);
    return NextResponse.json({ error: "Failed to calculate match score" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return matchScoreWithDeps(request, buildMatchScoreDeps());
}


