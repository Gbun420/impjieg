import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { jobTitle, jobDescription, jobSkills, jobSector, jobType, jobRemoteType, candidateProfile } = await request.json();

  if (!jobTitle || !candidateProfile) {
    return NextResponse.json(
      { error: "Job title and candidate profile are required" },
      { status: 400 }
    );
  }

  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    return NextResponse.json({ error: "AI service not configured" }, { status: 503 });
  }

  const prompt = `Analyze how well this candidate profile matches the job posting. Return ONLY valid JSON matching this schema:

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
- Title: ${jobTitle}
- Sector: ${jobSector || "Not specified"}
- Type: ${jobType || "Not specified"}
- Remote: ${jobRemoteType || "Not specified"}
- Skills: ${(jobSkills || []).join(", ") || "Not specified"}
- Description: ${jobDescription?.substring(0, 1000) || "Not provided"}

Candidate Profile:
- Name: ${candidateProfile.fullName || "Not provided"}
- Headline: ${candidateProfile.headline || "Not provided"}
- Skills: ${(candidateProfile.skills || []).join(", ") || "Not provided"}
- Experience: ${candidateProfile.experienceYears || 0} years
- Sectors: ${(candidateProfile.sectors || []).join(", ") || "Not specified"}
- Job Types: ${(candidateProfile.jobTypes || []).join(", ") || "Not specified"}
- Remote Preference: ${candidateProfile.remotePreference || "Not specified"}
- Bio: ${candidateProfile.bio?.substring(0, 500) || "Not provided"}

Scoring guidelines:
- Sector match: +20 points
- Job type match: +15 points  
- Remote preference match: +10 points
- Skill overlap (each matching skill): +5 points (max 30)
- Experience level appropriate: +15 points
- Salary alignment: +10 points

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
            content: "You are an expert recruiter analyzing candidate-job fit. Provide accurate, fair assessments. Always return valid JSON only.",
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
      console.error("Groq API error:", data);
      return NextResponse.json({ error: "Failed to calculate match score" }, { status: 500 });
    }

    const matchAnalysis = JSON.parse(data.choices[0].message.content);

    return NextResponse.json({ matchAnalysis });
  } catch (error) {
    console.error("Match scoring error:", error);
    return NextResponse.json({ error: "Failed to calculate match score" }, { status: 500 });
  }
}
