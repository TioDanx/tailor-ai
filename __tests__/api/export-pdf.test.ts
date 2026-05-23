import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  verifyIdToken: vi.fn(),
}));

vi.mock("@/lib/firebaseAdmin", () => ({
  adminAuth: { verifyIdToken: mocks.verifyIdToken },
}));

import { POST } from "@/app/api/export-pdf/route";

const mockCvData = {
  contact_info:    { name: "John Doe", email: "john@example.com", phone: "555-0100" },
  description:     "Senior frontend developer.",
  experience:      [{ role: "Developer", company: "Acme", startDate: "Jan 2022", endDate: "Present", location: "NY", bullets: ["Built features"] }],
  education:       [{ degree: "BSc", institution: "MIT", field: "CS", year: "2020" }],
  additional_info: { skills: "React, TypeScript" },
  projects:        [],
};

function makeReq(body: unknown, token = "valid-token"): NextRequest {
  return {
    headers: { get: (k: string) => k === "authorization" ? `Bearer ${token}` : null },
    json:    () => Promise.resolve(body),
  } as unknown as NextRequest;
}

describe("POST /api/export-pdf", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.verifyIdToken.mockResolvedValue({ uid: "user-1" });
  });

  it("returns 401 on invalid token", async () => {
    mocks.verifyIdToken.mockRejectedValue(new Error("invalid"));
    const res = await POST(makeReq({ cvData: mockCvData }));
    expect(res.status).toBe(401);
  });

  it("returns 400 when cvData is missing", async () => {
    const res = await POST(makeReq({}));
    expect(res.status).toBe(400);
  });

  it("returns 501 when Puppeteer is not available", async () => {
    const res  = await POST(makeReq({ cvData: mockCvData }));
    const body = await res.json();

    expect(res.status).toBe(501);
    expect(body.error).toBe("server-pdf-unavailable");
  });
});
