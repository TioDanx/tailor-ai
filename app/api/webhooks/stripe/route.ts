import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import Stripe from "stripe";

const PLAN_CREDITS: Record<string, number> = {
  starter: 50,
  pro:     100,
};

export async function POST(req: NextRequest) {
  const body      = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const uid     = session.metadata?.uid;
    const plan    = session.metadata?.plan as "starter" | "pro" | undefined;

    if (!uid || !plan) {
      return NextResponse.json({ received: true });
    }

    // Idempotency check
    const eventRef = adminDb.collection("stripeEvents").doc(event.id);
    const existing = await eventRef.get();
    if (existing.exists) {
      return NextResponse.json({ received: true });
    }

    const credits = PLAN_CREDITS[plan] ?? 0;

    await adminDb.runTransaction(async (tx) => {
      tx.set(eventRef, { processedAt: FieldValue.serverTimestamp() });
      tx.update(adminDb.collection("users").doc(uid), {
        plan,
        cvCredits: FieldValue.increment(credits),
      });
    });
  }

  return NextResponse.json({ received: true });
}
