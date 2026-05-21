import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { text } = await request.json();

  if (!text || text.trim().length < 20) {
    return NextResponse.json(
      { error: "Text is required (minimum 20 characters)" },
      { status: 400 }
    );
  }

  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
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
            content: "You are an DEI expert analyzing job postings for inclusive language. Identify biased or exclusionary language and suggest alternatives. Always return valid JSON only.",
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
      console.error("Groq API error:", data);
      return NextResponse.json({ error: "Failed to analyze text" }, { status: 500 });
    }

    const analysis = JSON.parse(data.choices[0].message.content);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Bias check error:", error);
    return NextResponse.json({ error: "Failed to analyze text" }, { status: 500 });
  }
}
