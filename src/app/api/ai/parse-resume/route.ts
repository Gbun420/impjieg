import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { resumeText } = await request.json();

  if (!resumeText || resumeText.trim().length < 50) {
    return NextResponse.json(
      { error: "Resume text is required (minimum 50 characters)" },
      { status: 400 }
    );
  }

  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
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
            content: "You are a resume parsing expert. Extract structured data from resumes/CVs. Always return valid JSON only, no additional text.",
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
      console.error("Groq API error:", data);
      return NextResponse.json({ error: "Failed to parse resume" }, { status: 500 });
    }

    const parsed = JSON.parse(data.choices[0].message.content);

    return NextResponse.json({ parsed });
  } catch (error) {
    console.error("Resume parsing error:", error);
    return NextResponse.json({ error: "Failed to parse resume" }, { status: 500 });
  }
}
