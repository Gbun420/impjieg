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

const biasCheckBodySchema = z.object({
  text: z.string(),
});

const MAX_BIAS_CHECK_BODY_BYTES = 24_576;
const MAX_BIAS_CHECK_TEXT_CHARS = 12_000;
const BIAS_CHECK_RATE_LIMIT = 8;
const BIAS_CHECK_RATE_LIMIT_WINDOW_MS = 60_000;

type BiasCheckDeps = {
  getUser: () => Promise<AiAuthenticatedUser | null>;
  fetchImpl: typeof fetch;
  groqApiKey?: string | undefined;
  rateLimit?: {
    limit: number;
    windowMs: number;
  };
};

function buildBiasCheckDeps(): BiasCheckDeps {
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
      limit: BIAS_CHECK_RATE_LIMIT,
      windowMs: BIAS_CHECK_RATE_LIMIT_WINDOW_MS,
    },
  };
}

async function biasCheckWithDeps(request: Request, deps: BiasCheckDeps) {
  try {
    const user = await deps.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    enforceAiRateLimit({
      key: buildAiRateLimitKey("bias-check", user, request),
      limit: deps.rateLimit?.limit ?? BIAS_CHECK_RATE_LIMIT,
      windowMs: deps.rateLimit?.windowMs ?? BIAS_CHECK_RATE_LIMIT_WINDOW_MS,
    });

    const payload = biasCheckBodySchema.safeParse(
      await readJsonBodyWithLimit<Record<string, unknown>>({
        request,
        maxBytes: MAX_BIAS_CHECK_BODY_BYTES,
      })
    );

    if (!payload.success) {
      return NextResponse.json({ error: "Invalid analysis text" }, { status: 400 });
    }

    const text = normalizePromptText(payload.data.text);
    if (text.length < 20) {
      return NextResponse.json(
        { error: "Text is required (minimum 20 characters)" },
        { status: 400 }
      );
    }

    ensureLengthWithinLimit(text, MAX_BIAS_CHECK_TEXT_CHARS, "Text is too large.");

    if (!deps.groqApiKey) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 503 });
    }

    const prompt = `Analyze the following job posting text for biased, exclusionary, or problematic language. Return ONLY valid JSON matching this schema:

{
  "isClean": "boolean - true if no issues found",
  "issues": [
    {
      "type": "string - one of: 'gender', 'age', 'cultural', 'ableist', 'exclusionary', 'tone'",
      "text": "string - the problematic phrase found",
      "severity": "string - 'high', 'medium', or 'low'",
      "explanation": "string - why this is problematic",
      "suggestion": "string - inclusive alternative"
    }
  ],
  "overallScore": "number 0-100 - 100 is perfectly inclusive",
  "summary": "string - 1-2 sentence summary of the analysis"
}

Check for:
- Gender-coded language (e.g., "ninja", "rockstar", "dominant", "nurturing")
- Age-related terms (e.g., "digital native", "young team", "recent graduate" when not required)
- Cultural bias (e.g., requiring specific cultural background)
- Ableist language (e.g., "able to lift", "normal health")
- Exclusionary requirements (e.g., "must be local" when remote is possible)
- Overly aggressive tone (e.g., "fast-paced environment" can deter some candidates)
- Unnecessary physical requirements
- Educational requirements that aren't truly needed

Job posting text:
${text}

Return ONLY the JSON object, no markdown fences, no explanation.`;

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
              "You are an DEI expert analyzing job postings for inclusive language. Identify biased or exclusionary language and suggest alternatives. Always return valid JSON only.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 1024,
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API error:", response.status);
      return NextResponse.json({ error: "Failed to analyze text" }, { status: 502 });
    }

    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      return NextResponse.json({ error: "Failed to analyze text" }, { status: 502 });
    }

    let analysis: unknown;
    try {
      analysis = JSON.parse(content);
    } catch {
      return NextResponse.json({ error: "Failed to analyze text" }, { status: 502 });
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    if (error instanceof AiSecurityError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Bias check error:", error);
    return NextResponse.json({ error: "Failed to analyze text" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return biasCheckWithDeps(request, buildBiasCheckDeps());
}

export {
  BIAS_CHECK_RATE_LIMIT,
  BIAS_CHECK_RATE_LIMIT_WINDOW_MS,
  MAX_BIAS_CHECK_BODY_BYTES,
  MAX_BIAS_CHECK_TEXT_CHARS,
  biasCheckWithDeps,
};
