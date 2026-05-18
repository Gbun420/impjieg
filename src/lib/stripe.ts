import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
      apiVersion: "2026-04-22.dahlia",
      typescript: true,
    });
  }
  return stripeInstance;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const client = getStripe();
    return client[prop as keyof Stripe];
  },
});

export const PRICES = {
  standard: process.env.STRIPE_PRICE_STANDARD || "",
  featured: process.env.STRIPE_PRICE_FEATURED || "",
};
