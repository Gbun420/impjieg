import { NextResponse } from "next/server";
import { sanitizeJobDescription } from "@/lib/job-description";

export async function POST(request: Request) {
  const { title, sector, jobType, seniority, location, description, skills, benefits } = await request.json();

  if (!title) {
    return NextResponse.json({ error: "Job title is required" }, { status: 400 });
  }

  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    return NextResponse.json({ error: "AI service not configured" }, { status: 503 });
  }

  const prompt = `Generate a professional job description for the following role:

Job Title: ${title}
Sector: ${sector || "General"}
Job Type: ${jobType || "Full-time"}
Seniority: ${seniority || "Mid Level"}
Location: ${location || "Malta"}
${skills ? `Key Skills: ${skills}` : ""}
${benefits ? `Benefits: ${benefits}` : ""}
${description ? `Additional context: ${description}` : ""}

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

  try {
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
      return NextResponse.json({ error: "Failed to generate description" }, { status: 500 });
    }

    const generatedDescription = sanitizeJobDescription(
      data.choices[0].message.content || ""
    );

    return NextResponse.json({ description: generatedDescription });
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json({ error: "Failed to generate description" }, { status: 500 });
  }
}
