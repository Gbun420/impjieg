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
  standard:
    process.env.STRIPE_PRICE_STANDARD || "price_dev_standard",
  featured:
    process.env.STRIPE_PRICE_FEATURED || "price_dev_featured",
};
