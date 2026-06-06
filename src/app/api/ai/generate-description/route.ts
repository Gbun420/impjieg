import { NextResponse } from "next/server";
import { sanitizeJobDescription } from "@/lib/job-description";
import { createClient } from "@/lib/supabase/server";
import {
  AiSecurityError,
  buildAiRateLimitKey,
  ensureLengthWithinLimit,
  enforceAiRateLimit,
  normalizePromptText,
  readJsonBodyWithLimit,
  sanitizePromptInput,
  type AiAuthenticatedUser,
} from "@/lib/ai-security";
import { z } from "zod";

const generateDescriptionBodySchema = z.object({
  title: z.string().trim().min(1).max(200),
  sector: z.string().trim().max(100).optional().nullable(),
  jobType: z.string().trim().max(100).optional().nullable(),
  seniority: z.string().trim().max(100).optional().nullable(),
  location: z.string().trim().max(100).optional().nullable(),
  description: z.string().trim().max(4000).optional().nullable(),
  skills: z.string().trim().max(1000).optional().nullable(),
  benefits: z.string().trim().max(1000).optional().nullable(),
});

const MAX_GEN_DESC_BODY_BYTES = 16_384;
const MAX_GEN_DESC_PROMPT_CHARS = 8_000;
const GEN_DESC_RATE_LIMIT = 5;
const GEN_DESC_RATE_LIMIT_WINDOW_MS = 60_000;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const aiUser: AiAuthenticatedUser = { id: user.id, email: user.email };

    await enforceAiRateLimit({
      key: buildAiRateLimitKey("generate-description", aiUser, request),
      limit: GEN_DESC_RATE_LIMIT,
      windowMs: GEN_DESC_RATE_LIMIT_WINDOW_MS,
    });

    const body = await readJsonBodyWithLimit<unknown>({
      request,
      maxBytes: MAX_GEN_DESC_BODY_BYTES,
    });

    const payload = generateDescriptionBodySchema.safeParse(body);

    if (!payload.success) {
      return NextResponse.json({ error: "Invalid job description data" }, { status: 400 });
    }

    const { title, sector, jobType, seniority, location, description, skills, benefits } = payload.data;

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 503 });
    }

    const safeTitle = sanitizePromptInput(title, 200);
    const safeSector = sector ? sanitizePromptInput(sector, 100) : "General";
    const safeJobType = jobType ? sanitizePromptInput(jobType, 100) : "Full-time";
    const safeSeniority = seniority ? sanitizePromptInput(seniority, 100) : "Mid Level";
    const safeLocation = location ? sanitizePromptInput(location, 100) : "Malta";
    const safeSkills = skills ? sanitizePromptInput(skills, 1000) : "";
    const safeBenefits = benefits ? sanitizePromptInput(benefits, 1000) : "";
    const safeDescription = description ? sanitizePromptInput(description, 4000) : "";

    const prompt = `Generate a professional job description for the following role:

Job Title: ${safeTitle}
Sector: ${safeSector}
Job Type: ${safeJobType}
Seniority: ${safeSeniority}
Location: ${safeLocation}
${safeSkills ? `Key Skills: ${safeSkills}` : ""}
${safeBenefits ? `Benefits: ${safeBenefits}` : ""}
${safeDescription ? `Additional context: ${safeDescription}` : ""}

Format the response as plain text with these sections:
1. A compelling 2-3 sentence role overview
2. Key Responsibilities
3. Requirements & Qualifications
4. What We Offer

Use short headings followed by bullet points with simple hyphens.
Keep it concise, professional, and tailored to the Malta job market.
Do not include HTML, Markdown tables, code fences, or tags.
Only return plain text.

IMPORTANT: Use inclusive, gender-neutral language. Avoid age-related terms. Focus on skills and competencies, not personal characteristics.`;

    ensureLengthWithinLimit(
      normalizePromptText(prompt),
      MAX_GEN_DESC_PROMPT_CHARS,
      "Job description input is too large."
    );

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are an expert HR writer specializing in creating inclusive, bias-free job descriptions for the Malta job market. Always use gender-neutral language, avoid age-related terms, and focus on skills and competencies. Return clean plain text only.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API error:", data);
      return NextResponse.json({ error: "Failed to generate description" }, { status: 502 });
    }

    const generatedDescription = sanitizeJobDescription(
      data.choices[0].message.content || ""
    );

    return NextResponse.json({ description: generatedDescription });
  } catch (error) {
    if (error instanceof AiSecurityError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("AI generation error:", error);
    return NextResponse.json({ error: "Failed to generate description" }, { status: 500 });
  }
}
