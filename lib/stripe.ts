import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(key, { apiVersion: "2026-02-25.clover" });
  }
  return _stripe;
}

export const PLANS = {
  starter: {
    priceId:   process.env.STRIPE_STARTER_PRICE_ID!,
    credits:   50,
    name:      "Starter",
    price:     10,
  },
  pro: {
    priceId:   process.env.STRIPE_PRO_PRICE_ID!,
    credits:   100,
    name:      "Pro",
    price:     20,
  },
} as const;
