import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

// ── Hoist shared mocks ────────────────────────────────────────────────────────
const mocks = vi.hoisted(() => ({
  verifyIdToken:   vi.fn(),
  runTransaction:  vi.fn(),
  userUpdate:      vi.fn(),
  histSet:         vi.fn(),
  generateContent: vi.fn(),
}));

vi.mock("@/lib/firebaseAdmin", () => ({
  adminAuth: { verifyIdToken: mocks.verifyIdToken },
  adminDb: {
    collection: vi.fn().mockReturnValue({
      doc: vi.fn().mockReturnValue({
        update:     mocks.userUpdate,
        collection: vi.fn().mockReturnValue({
          doc: vi.fn().mockReturnValue({ set: mocks.histSet }),
        }),
      }),
    }),
    runTransaction: mocks.runTransaction,
  },
}));

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() { return { generateContent: mocks.generateContent }; }
  },
}));

vi.mock("firebase-admin/firestore", () => ({
  FieldValue: {
    increment:       (n: number) => `increment(${n})`,
    serverTimestamp: ()          => "SERVER_TS",
  },
}));

vi.mock("nanoid",          () => ({ nanoid: () => "test-cvid" }));
vi.mock("@/lib/ai",        () => ({ GEMINI_MODEL: "gemini-test" }));
vi.mock("@/utils/atsScore", () => ({
  calculateATSScore: vi.fn().mockReturnValue({ score: 85, matched: [], missing: [] }),
}));

// Import after mocks
import { POST } from "@/app/api/generate-cv/route";

// ── Fixtures ──────────────────────────────────────────────────────────────────
const mockProfile = {
  name:             "Ana López",
  email:            "ana@example.com",
  phone:            "+54911234567",
  linkedin:         "https://linkedin.com/in/ana",
  location:         "Buenos Aires",
  title:            "Frontend Dev",
  shortDescription: "Experienced dev",
  hardSkills:       ["React"],
  softSkills:       ["Communication"],
  experience:       [],
  education:        [],
  cvCredits:        5,
  unlimited:        false,
};

const mockJDA = {
  role:           "Frontend Developer",
  seniority:      "Mid",
  requiredSkills: ["React"],
  niceToHave:     [],
  atsKeywords:    ["react", "typescript"],
  domain:         "SaaS",
  lang:           "en" as const,
  rawSummary:     "A frontend role.",
};

const mockCvData = {
  contact_info:    { name: "Ana López", email: "ana@example.com", phone: "+54911234567", location: "Buenos Aires", linkedin: null, portfolio: null },
  description:     "Professional summary",
  experience:      [],
  education:       [],
  additional_info: { skills: "React" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeReq(body: unknown, token = "valid-token"): NextRequest {
  return {
    headers: { get: (k: string) => k === "authorization" ? `Bearer ${token}` : null },
    json:    () => Promise.resolve(body),
  } as unknown as NextRequest;
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("POST /api/generate-cv", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.verifyIdToken.mockResolvedValue({ uid: "user-1" });

    // Default: user has credits, transaction succeeds
    mocks.runTransaction.mockImplementation(async (cb: (tx: unknown) => Promise<void>) => {
      await cb({
        get:    vi.fn().mockResolvedValue({ data: () => mockProfile }),
        update: vi.fn(),
      });
    });

    mocks.generateContent.mockResolvedValue({
      response: { text: () => JSON.stringify(mockCvData) },
    });

    mocks.userUpdate.mockResolvedValue(undefined);
    mocks.histSet.mockResolvedValue(undefined);
  });

  it("returns 401 when the auth token is invalid", async () => {
    mocks.verifyIdToken.mockRejectedValue(new Error("Unauthorized"));
    const res = await POST(makeReq({ jobDescription: "jd", jdAnalysis: mockJDA }, "bad-token"));
    expect(res.status).toBe(401);
  });

  it("returns 400 when jobDescription or jdAnalysis is missing", async () => {
    const res = await POST(makeReq({ jobDescription: "" }));
    expect(res.status).toBe(400);
  });

  it("returns 402 when the user has no credits", async () => {
    mocks.runTransaction.mockImplementation(async (cb: (tx: unknown) => Promise<void>) => {
      await cb({
        get:    vi.fn().mockResolvedValue({ data: () => ({ cvCredits: 0, unlimited: false }) }),
        update: vi.fn(),
      });
    });
    const res = await POST(makeReq({ jobDescription: "Build a React app", jdAnalysis: mockJDA }));
    expect(res.status).toBe(402);
  });

  it("includes email, phone, linkedin, and location in the Gemini prompt", async () => {
    await POST(makeReq({ jobDescription: "Build UI components", jdAnalysis: mockJDA }));

    const prompt = mocks.generateContent.mock.calls[0][0] as string;
    expect(prompt).toContain("ana@example.com");
    expect(prompt).toContain("+54911234567");
    expect(prompt).toContain("linkedin.com/in/ana");
    expect(prompt).toContain("Buenos Aires");
  });

  it("returns the generated cvData and atsScore on success", async () => {
    const res = await POST(makeReq({ jobDescription: "Build UI components", jdAnalysis: mockJDA }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.cvData).toBeDefined();
    expect(body.atsScore).toBe(85);
  });
});
