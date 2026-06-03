import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";
import { resetAiRateLimitState } from "@/lib/ai-security";
import {
  MAX_PARSE_RESUME_BODY_BYTES,
  MAX_RESUME_TEXT_CHARS,
  parseResumeWithDeps,
} from "./parse-resume/route";
import { MAX_BIAS_CHECK_TEXT_CHARS, biasCheckWithDeps } from "./bias-check/route";
import {
  matchScoreWithDeps,
} from "./match-score/route";

beforeEach(() => {
  resetAiRateLimitState();
});

function makeJsonRequest(path: string, payload: string, extraHeaders: HeadersInit = {}) {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Content-Length": String(Buffer.byteLength(payload)),
    "x-forwarded-for": "203.0.113.10",
    ...extraHeaders,
  });

  return new Request(`https://impjieg.vercel.app${path}`, {
    method: "POST",
    headers,
    body: payload,
  });
}

function makeGroqResponse(content: string, ok = true, status = 200) {
  return Promise.resolve(
    new Response(
      JSON.stringify({
        choices: [{ message: { content } }],
      }),
      {
        status: ok ? status : 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  );
}

const authenticatedUser = { id: "user_123", email: "user@example.com" };

test("parse-resume rejects unauthenticated requests", async () => {
  const response = await parseResumeWithDeps(
    makeJsonRequest("/api/ai/parse-resume", JSON.stringify({ resumeText: "A".repeat(100) })),
    {
      getUser: async () => null,
      fetchImpl: fetch,
      groqApiKey: "test-key",
    }
  );

  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.error, "Unauthorized");
});

test("parse-resume rejects malformed JSON", async () => {
  const response = await parseResumeWithDeps(
    makeJsonRequest("/api/ai/parse-resume", "{"),
    {
      getUser: async () => authenticatedUser,
      fetchImpl: fetch,
      groqApiKey: "test-key",
    }
  );

  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.error, "Invalid JSON body.");
});

test("parse-resume rejects oversized request bodies", async () => {
  const oversizedPayload = JSON.stringify({ resumeText: "A".repeat(MAX_RESUME_TEXT_CHARS + 1) });
  const response = await parseResumeWithDeps(
    makeJsonRequest("/api/ai/parse-resume", oversizedPayload, {
      "Content-Length": String(MAX_PARSE_RESUME_BODY_BYTES + 1),
    }),
    {
      getUser: async () => authenticatedUser,
      fetchImpl: fetch,
      groqApiKey: "test-key",
    }
  );

  const body = await response.json();

  assert.equal(response.status, 413);
  assert.equal(body.error, "Request body too large.");
});

test("parse-resume returns parsed data for a valid request", async () => {
  const response = await parseResumeWithDeps(
    makeJsonRequest(
      "/api/ai/parse-resume",
      JSON.stringify({ resumeText: "A".repeat(120) })
    ),
    {
      getUser: async () => authenticatedUser,
      fetchImpl: async () => makeGroqResponse(JSON.stringify({ fullName: "Jane Doe", skills: ["React"] })),
      groqApiKey: "test-key",
    }
  );

  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body.parsed, { fullName: "Jane Doe", skills: ["React"] });
});

test("bias-check rejects oversized input text", async () => {
  const response = await biasCheckWithDeps(
    makeJsonRequest(
      "/api/ai/bias-check",
      JSON.stringify({ text: "B".repeat(MAX_BIAS_CHECK_TEXT_CHARS + 1) })
    ),
    {
      getUser: async () => authenticatedUser,
      fetchImpl: fetch,
      groqApiKey: "test-key",
    }
  );

  const body = await response.json();

  assert.equal(response.status, 413);
  assert.equal(body.error, "Text is too large.");
});

test("match-score returns parsed data for a valid request", async () => {
  const response = await matchScoreWithDeps(
    makeJsonRequest(
      "/api/ai/match-score",
      JSON.stringify({
        jobTitle: "Senior Frontend Developer",
        jobDescription: "Build user interfaces",
        jobSkills: ["React", "TypeScript"],
        jobSector: "Technology",
        jobType: "Full-time",
        jobRemoteType: "Hybrid",
        candidateProfile: {
          fullName: "Jane Doe",
          headline: "Frontend Developer",
          skills: ["React", "TypeScript"],
          experienceYears: 5,
          sectors: ["Technology"],
          jobTypes: ["Full-time"],
          remotePreference: "Hybrid",
          bio: "Experienced frontend developer.",
        },
      })
    ),
    {
      getUser: async () => authenticatedUser,
      fetchImpl: async () => makeGroqResponse(JSON.stringify({ score: 91, matchLevel: "Excellent" })),
      groqApiKey: "test-key",
    }
  );

  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body.matchAnalysis, { score: 91, matchLevel: "Excellent" });
});

test("match-score rate limits repeated requests", async () => {
  const deps = {
    getUser: async () => authenticatedUser,
    fetchImpl: async () => makeGroqResponse(JSON.stringify({ score: 91, matchLevel: "Excellent" })),
    groqApiKey: "test-key",
    rateLimit: { limit: 1, windowMs: 60_000 },
  };

  const firstResponse = await matchScoreWithDeps(
    makeJsonRequest(
      "/api/ai/match-score",
      JSON.stringify({
        jobTitle: "Senior Frontend Developer",
        candidateProfile: {
          skills: [],
          experienceYears: 0,
          sectors: [],
          jobTypes: [],
        },
      })
    ),
    deps
  );

  const secondResponse = await matchScoreWithDeps(
    makeJsonRequest(
      "/api/ai/match-score",
      JSON.stringify({
        jobTitle: "Senior Frontend Developer",
        candidateProfile: {
          skills: [],
          experienceYears: 0,
          sectors: [],
          jobTypes: [],
        },
      })
    ),
    deps
  );

  const firstBody = await firstResponse.json();
  const secondBody = await secondResponse.json();

  assert.equal(firstResponse.status, 200);
  assert.equal(firstBody.matchAnalysis.score, 91);
  assert.equal(secondResponse.status, 429);
  assert.equal(secondBody.error, "Too many requests. Please try again later.");
});
