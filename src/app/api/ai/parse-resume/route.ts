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

const parseResumeBodySchema = z.object({
  resumeText: z.string(),
});

const MAX_PARSE_RESUME_BODY_BYTES = 32_768;
const MAX_RESUME_TEXT_CHARS = 20_000;
const PARSE_RESUME_RATE_LIMIT = 5;
const PARSE_RESUME_RATE_LIMIT_WINDOW_MS = 60_000;

type ParseResumeDeps = {
  getUser: () => Promise<AiAuthenticatedUser | null>;
  fetchImpl: typeof fetch;
  groqApiKey?: string | undefined;
  rateLimit?: {
    limit: number;
    windowMs: number;
  };
};

function buildParseResumeDeps(): ParseResumeDeps {
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
      limit: PARSE_RESUME_RATE_LIMIT,
      windowMs: PARSE_RESUME_RATE_LIMIT_WINDOW_MS,
    },
  };
}

async function parseResumeWithDeps(request: Request, deps: ParseResumeDeps) {
  try {
    const user = await deps.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await enforceAiRateLimit({
      key: buildAiRateLimitKey("parse-resume", user, request),
      limit: deps.rateLimit?.limit ?? PARSE_RESUME_RATE_LIMIT,
      windowMs: deps.rateLimit?.windowMs ?? PARSE_RESUME_RATE_LIMIT_WINDOW_MS,
    });

    const payload = parseResumeBodySchema.safeParse(
      await readJsonBodyWithLimit<Record<string, unknown>>({
        request,
        maxBytes: MAX_PARSE_RESUME_BODY_BYTES,
      })
    );

    if (!payload.success) {
      return NextResponse.json({ error: "Invalid resume data" }, { status: 400 });
    }

    const resumeText = normalizePromptText(payload.data.resumeText);
    if (resumeText.length < 50) {
      return NextResponse.json(
        { error: "Resume text is required (minimum 50 characters)" },
        { status: 400 }
      );
    }

    ensureLengthWithinLimit(
      resumeText,
      MAX_RESUME_TEXT_CHARS,
      "Resume text is too large."
    );

    if (!deps.groqApiKey) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 503 });
    }

    const prompt = `Parse the following resume/CV text and extract structured information. Return ONLY valid JSON matching this schema:

{
  "fullName": "string - the person's full name",
  "headline": "string - professional title or summary (e.g. Senior Frontend Developer)",
  "email": "string - email address if found, null otherwise",
  "phone": "string - phone number if found, null otherwise",
  "location": "string - city/country if found, null otherwise",
  "bio": "string - 2-3 sentence professional summary",
  "skills": ["string array - all technical and soft skills found"],
  "experienceYears": "number - estimated years of professional experience",
  "desiredSalaryMin": "number - null (not extractable from resume)",
  "desiredSalaryMax": "number - null (not extractable from resume)",
  "jobTypes": ["string array - infer from experience: Full-time, Part-time, Contract, Freelance"],
  "sectors": ["string array - infer industry sectors from experience"],
  "remotePreference": "string - null (not extractable from resume)",
  "isOpenToWork": "boolean - true if resume suggests active job seeking",
  "workHistory": [
    {
      "title": "string - job title",
      "company": "string - company name",
      "startDate": "string - approximate start date",
      "endDate": "string - approximate end date or 'Present'",
      "description": "string - brief description of role"
    }
  ],
  "education": [
    {
      "degree": "string - degree or qualification",
      "institution": "string - school/university name",
      "year": "string - graduation year"
    }
  ]
}

Rules:
- Extract only what's present in the resume. Use null for missing fields.
- Skills should be specific technologies, tools, methodologies, and soft skills.
- Sectors should map to common industries: Technology, Finance & Banking, Healthcare, iGaming, Tourism & Hospitality, Marketing & Media, Education, Legal & Compliance, etc.
- Estimate experience years from work history dates.
- Return ONLY the JSON object, no markdown fences, no explanation.

Resume text:
${resumeText}`;

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
              "You are a resume parsing expert. Extract structured data from resumes/CVs. Always return valid JSON only, no additional text.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 2048,
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API error:", response.status);
      return NextResponse.json({ error: "Failed to parse resume" }, { status: 502 });
    }

    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      return NextResponse.json({ error: "Failed to parse resume" }, { status: 502 });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json({ error: "Failed to parse resume" }, { status: 502 });
    }

    return NextResponse.json({ parsed });
  } catch (error) {
    if (error instanceof AiSecurityError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Resume parsing error:", error);
    return NextResponse.json({ error: "Failed to parse resume" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return parseResumeWithDeps(request, buildParseResumeDeps());
}


