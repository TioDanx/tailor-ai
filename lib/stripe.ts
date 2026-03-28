import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

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
