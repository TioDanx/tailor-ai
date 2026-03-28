import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

// ── Hoist shared mocks ────────────────────────────────────────────────────────
const mocks = vi.hoisted(() => ({
  verifyIdToken: vi.fn(),
}));

vi.mock("@/lib/firebaseAdmin", () => ({
  adminAuth: { verifyIdToken: mocks.verifyIdToken },
  adminDb:   {},
}));

vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() { return { generateContent: vi.fn() }; }
  },
}));

vi.mock("@/lib/ai", () => ({ GEMINI_MODEL: "gemini-test" }));

// Import after mocks
import { POST } from "@/app/api/parse-cv/route";

// ── Helpers ───────────────────────────────────────────────────────────────────
type MockFile = { name: string; type: string; size: number };

function makeReq(file: MockFile | null, token = "valid-token"): NextRequest {
  const fd = { get: (k: string) => k === "cv" ? file : null };
  return {
    headers:  { get: (k: string) => k === "authorization" ? `Bearer ${token}` : null },
    formData: () => Promise.resolve(fd),
  } as unknown as NextRequest;
}

const validFile:   MockFile = { name: "cv.pdf",  type: "application/pdf", size: 500_000 };
const invalidType: MockFile = { name: "cv.docx", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 500_000 };
const tooBig:      MockFile = { name: "cv.pdf",  type: "application/pdf", size: 11 * 1024 * 1024 };

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("POST /api/parse-cv", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.verifyIdToken.mockResolvedValue({ uid: "user-1" });
  });

  it("returns 401 when auth token is invalid", async () => {
    mocks.verifyIdToken.mockRejectedValue(new Error("Unauthorized"));
    const res = await POST(makeReq(validFile, "bad-token"));
    expect(res.status).toBe(401);
  });

  it("returns 400 when no file is attached", async () => {
    const res = await POST(makeReq(null));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/no file/i);
  });

  it("returns 400 for unsupported file types (e.g. .docx)", async () => {
    const res = await POST(makeReq(invalidType));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/pdf|txt|supported/i);
  });

  it("returns 400 when the file exceeds the 10 MB size limit", async () => {
    const res = await POST(makeReq(tooBig));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/large|10mb/i);
  });
});
