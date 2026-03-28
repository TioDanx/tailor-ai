import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

// ── Hoist shared mocks before module loading ──────────────────────────────────
const mocks = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  docGet:         vi.fn(),
  runTransaction: vi.fn(),
  txSet:          vi.fn(),
  txUpdate:       vi.fn(),
}));

vi.mock("@/lib/stripe", () => ({
  stripe: { webhooks: { constructEvent: mocks.constructEvent } },
}));

vi.mock("@/lib/firebaseAdmin", () => ({
  adminDb: {
    collection: vi.fn().mockReturnValue({
      doc: vi.fn().mockReturnValue({ get: mocks.docGet }),
    }),
    runTransaction: mocks.runTransaction,
  },
  adminAuth: { verifyIdToken: vi.fn() },
}));

vi.mock("firebase-admin/firestore", () => ({
  FieldValue: {
    increment:       (n: number) => `increment(${n})`,
    serverTimestamp: ()          => "SERVER_TS",
  },
}));

// Import after mocks are registered
import { POST } from "@/app/api/webhooks/stripe/route";

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeReq(body: string, sig = "valid-sig"): NextRequest {
  return {
    text:    () => Promise.resolve(body),
    headers: { get: (k: string) => k === "stripe-signature" ? sig : null },
  } as unknown as NextRequest;
}

function makeCheckoutEvent(plan: string, uid: string, id = "evt_1") {
  return {
    type: "checkout.session.completed",
    id,
    data: { object: { metadata: { uid, plan } } },
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("POST /api/webhooks/stripe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: transaction executes its callback normally
    mocks.runTransaction.mockImplementation(async (cb: (tx: unknown) => Promise<void>) => {
      await cb({ set: mocks.txSet, update: mocks.txUpdate });
    });
  });

  it("returns 400 when Stripe signature is invalid", async () => {
    mocks.constructEvent.mockImplementation(() => { throw new Error("Bad signature"); });
    const res = await POST(makeReq("{}", "tampered-sig"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid signature");
  });

  it("returns 200 without touching DB for unhandled event types", async () => {
    mocks.constructEvent.mockReturnValue({
      type: "payment_intent.created",
      id:   "evt_pi",
      data: { object: {} },
    });
    const res = await POST(makeReq("{}"));
    expect(res.status).toBe(200);
    expect(mocks.runTransaction).not.toHaveBeenCalled();
  });

  it("grants 50 credits and sets plan to starter", async () => {
    mocks.constructEvent.mockReturnValue(makeCheckoutEvent("starter", "u1"));
    mocks.docGet.mockResolvedValue({ exists: false });

    await POST(makeReq("{}"));

    expect(mocks.txUpdate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ plan: "starter", cvCredits: "increment(50)" })
    );
  });

  it("grants 100 credits and sets plan to pro", async () => {
    mocks.constructEvent.mockReturnValue(makeCheckoutEvent("pro", "u2", "evt_pro"));
    mocks.docGet.mockResolvedValue({ exists: false });

    await POST(makeReq("{}"));

    expect(mocks.txUpdate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ plan: "pro", cvCredits: "increment(100)" })
    );
  });

  it("skips the DB write for a duplicate event (idempotency)", async () => {
    mocks.constructEvent.mockReturnValue(makeCheckoutEvent("pro", "u3", "evt_dup"));
    mocks.docGet.mockResolvedValue({ exists: true }); // already processed

    const res = await POST(makeReq("{}"));

    expect(res.status).toBe(200);
    expect(mocks.runTransaction).not.toHaveBeenCalled();
  });

  it("returns 200 without DB write when metadata uid or plan is missing", async () => {
    mocks.constructEvent.mockReturnValue({
      type: "checkout.session.completed",
      id:   "evt_no_meta",
      data: { object: { metadata: {} } },
    });

    const res = await POST(makeReq("{}"));

    expect(res.status).toBe(200);
    expect(mocks.runTransaction).not.toHaveBeenCalled();
  });
});
