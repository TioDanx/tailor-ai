import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  verifyIdToken:   vi.fn(),
  userGet:         vi.fn(),
  generateContent: vi.fn(),
}));

vi.mock("@/lib/firebaseAdmin", () => ({
  adminAuth: { verifyIdToken: mocks.verifyIdToken },
  adminDb: {
    collection: vi.fn().mockReturnValue({
      doc: vi.fn().mockReturnValue({
        get: mocks.userGet,
      }),
    }),
  },
}));

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() { return { generateContent: mocks.generateContent }; }
  },
}));

vi.mock("@/lib/ai", () => ({ GEMINI_MODEL_CHAIN: ["gemini-test"] }));

import { POST } from "@/app/api/analyze-jd/route";

const mockAnalysis = {
  role:           "Frontend Developer",
  company:        "Acme Corp",
  seniority:      "Mid",
  requiredSkills: ["React", "TypeScript"],
  niceToHave:     ["GraphQL"],
  atsKeywords:    ["React", "TypeScript", "Next.js"],
  domain:         "SaaS",
  lang:           "en",
  rawSummary:     "A frontend role at Acme Corp.",
};

const mockProfile = {
  hardSkills:  ["React", "TypeScript"],
  softSkills:  ["Communication"],
  title:       "Frontend Developer",
  experience:  [{ startDate: "Jan 2022", endDate: "Present" }],
};

function makeReq(body: unknown, token = "valid-token"): NextRequest {
  return {
    headers: { get: (k: string) => k === "authorization" ? `Bearer ${token}` : null },
    json:    () => Promise.resolve(body),
  } as unknown as NextRequest;
}

describe("POST /api/analyze-jd", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.verifyIdToken.mockResolvedValue({ uid: "user-1" });
    mocks.userGet.mockResolvedValue({ data: () => undefined });
    mocks.generateContent.mockResolvedValue({
      response: { text: () => JSON.stringify(mockAnalysis) },
    });
  });

  it("returns 401 on invalid token", async () => {
    mocks.verifyIdToken.mockRejectedValue(new Error("invalid"));
    const res = await POST(makeReq({ jobDescription: "A job" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 when jobDescription is missing", async () => {
    const res = await POST(makeReq({}));
    expect(res.status).toBe(400);
  });

  it("returns 400 when jobDescription exceeds 15 000 characters", async () => {
    const res = await POST(makeReq({ jobDescription: "a".repeat(15_001) }));
    expect(res.status).toBe(400);
  });

  it("returns 200 without profileFit when user has no profile", async () => {
    mocks.userGet.mockResolvedValue({ data: () => undefined });

    const res  = await POST(makeReq({ jobDescription: "Frontend role" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.role).toBe("Frontend Developer");
    expect(body.profileFit).toBeUndefined();
  });

  it("returns 200 with profileFit when user profile exists", async () => {
    mocks.userGet.mockResolvedValue({ data: () => mockProfile });
    const analysisWithFit = {
      ...mockAnalysis,
      profileFit: {
        score:         80,
        label:         "Buen candidato",
        summary:       "Good fit.",
        matchedSkills: ["React"],
        missingSkills: [],
      },
    };
    mocks.generateContent.mockResolvedValue({
      response: { text: () => JSON.stringify(analysisWithFit) },
    });

    const res  = await POST(makeReq({ jobDescription: "Frontend role" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.profileFit).toBeDefined();
    expect(body.profileFit.score).toBe(80);
  });

  it("normalizes lang 'spanish' to 'es'", async () => {
    mocks.generateContent.mockResolvedValue({
      response: { text: () => JSON.stringify({ ...mockAnalysis, lang: "spanish" }) },
    });

    const res  = await POST(makeReq({ jobDescription: "Trabajo frontend" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.lang).toBe("es");
  });

  it("forces lang when a manual override is provided", async () => {
    mocks.generateContent.mockResolvedValue({
      response: { text: () => JSON.stringify({ ...mockAnalysis, lang: "en" }) },
    });

    const res  = await POST(makeReq({ jobDescription: "Trabajo frontend", lang: "es" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.lang).toBe("es");
  });

  it("returns 429 when Gemini rate-limits on all models", async () => {
    mocks.generateContent.mockRejectedValue({ status: 429 });
    const res = await POST(makeReq({ jobDescription: "Frontend role" }));
    expect(res.status).toBe(429);
  });

  it("ignores profile fetch errors and still returns 200", async () => {
    mocks.userGet.mockRejectedValue(new Error("Firestore unavailable"));
    const res = await POST(makeReq({ jobDescription: "Frontend role" }));
    expect(res.status).toBe(200);
  });
});
