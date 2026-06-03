import Stripe from "stripe";
import { requireEnv } from "@/lib/runtime-env";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(requireEnv("STRIPE_SECRET_KEY"), {
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
  standard: requireEnv("STRIPE_PRICE_STANDARD"),
  featured: requireEnv("STRIPE_PRICE_FEATURED"),
};
