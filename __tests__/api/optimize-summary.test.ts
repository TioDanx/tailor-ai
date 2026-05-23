import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  verifyIdToken:   vi.fn(),
  checkRateLimit:  vi.fn(),
  generateContent: vi.fn(),
}));

vi.mock("@/lib/firebaseAdmin", () => ({
  adminAuth: { verifyIdToken: mocks.verifyIdToken },
}));

vi.mock("@/lib/rateLimit", () => ({
  checkRateLimit: mocks.checkRateLimit,
}));

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() { return { generateContent: mocks.generateContent }; }
  },
}));

vi.mock("@/lib/ai", () => ({ GEMINI_MODEL_CHAIN: ["gemini-test"] }));

import { POST } from "@/app/api/optimize-summary/route";

function makeReq(body: unknown, token = "valid-token"): NextRequest {
  return {
    headers: { get: (k: string) => k === "authorization" ? `Bearer ${token}` : null },
    json:    () => Promise.resolve(body),
  } as unknown as NextRequest;
}

describe("POST /api/optimize-summary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.verifyIdToken.mockResolvedValue({ uid: "user-1" });
    mocks.checkRateLimit.mockResolvedValue(true);
    mocks.generateContent.mockResolvedValue({
      response: { text: () => "  Experienced frontend developer.  " },
    });
  });

  it("returns 401 on invalid token", async () => {
    mocks.verifyIdToken.mockRejectedValue(new Error("invalid"));
    const res = await POST(makeReq({ context: "Some context" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 when context is missing", async () => {
    const res = await POST(makeReq({}));
    expect(res.status).toBe(400);
  });

  it("returns 400 when context exceeds 4 000 characters", async () => {
    const res = await POST(makeReq({ context: "a".repeat(4_001) }));
    expect(res.status).toBe(400);
  });

  it("returns 429 when daily rate limit is exceeded", async () => {
    mocks.checkRateLimit.mockResolvedValue(false);
    const res = await POST(makeReq({ context: "My profile" }));
    expect(res.status).toBe(429);
  });

  it("returns 200 with trimmed summary from Gemini", async () => {
    const res  = await POST(makeReq({ context: "My profile" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.summary).toBe("Experienced frontend developer.");
  });

  it("returns 500 when Gemini fails on all models", async () => {
    mocks.generateContent.mockRejectedValue(new Error("API error"));
    const res = await POST(makeReq({ context: "My profile" }));
    expect(res.status).toBe(500);
  });
});
