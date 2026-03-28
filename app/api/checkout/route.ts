import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { stripe, PLANS } from "@/lib/stripe";
import { Plan } from "@/types";

export async function POST(req: NextRequest) {
  const token = (req.headers.get("authorization") ?? "").replace("Bearer ", "");
  let uid: string;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan } = await req.json() as { plan: "starter" | "pro" };

  if (!PLANS[plan]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const userSnap = await adminDb.collection("users").doc(uid).get();
  const profile  = userSnap.data() ?? {};

  // Get or create Stripe customer
  let customerId = profile.stripeCustomerId as string | undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email:    profile.email,
      name:     profile.name,
      metadata: { uid },
    });
    customerId = customer.id;
    await adminDb.collection("users").doc(uid).update({ stripeCustomerId: customerId });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    customer:   customerId,
    mode:       "payment",
    line_items: [{ price: PLANS[plan].priceId, quantity: 1 }],
    success_url: `${baseUrl}/dashboard?upgraded=1`,
    cancel_url:  `${baseUrl}/dashboard`,
    metadata:    { uid, plan },
  });

  return NextResponse.json({ url: session.url });
}
