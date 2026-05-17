import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.clover",
  typescript: true,
});

export const PRICES = {
  standard: process.env.STRIPE_PRICE_STANDARD!,
  featured: process.env.STRIPE_PRICE_FEATURED!,
};
