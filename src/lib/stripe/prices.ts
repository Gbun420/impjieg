/**
 * Stripe Price Resolver
 *
 * Maps product types to real Stripe price IDs from environment variables.
 * Never uses hardcoded/fake price IDs in production.
 */

const STRIPE_PRICE_STANDARD = process.env.STRIPE_PRICE_STANDARD;
const STRIPE_PRICE_FEATURED = process.env.STRIPE_PRICE_FEATURED;

const STRIPE_PRICE_BASIC_MONTHLY = process.env.STRIPE_PRICE_BASIC_MONTHLY;
const STRIPE_PRICE_BASIC_ANNUAL = process.env.STRIPE_PRICE_BASIC_ANNUAL;
const STRIPE_PRICE_PROFESSIONAL_MONTHLY = process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY;
const STRIPE_PRICE_PROFESSIONAL_ANNUAL = process.env.STRIPE_PRICE_PROFESSIONAL_ANNUAL;
const STRIPE_PRICE_ENTERPRISE_MONTHLY = process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY;
const STRIPE_PRICE_ENTERPRISE_ANNUAL = process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL;

const STRIPE_PRICE_CREDITS_STARTER = process.env.STRIPE_PRICE_CREDITS_STARTER;
const STRIPE_PRICE_CREDITS_STANDARD = process.env.STRIPE_PRICE_CREDITS_STANDARD;
const STRIPE_PRICE_CREDITS_PREMIUM = process.env.STRIPE_PRICE_CREDITS_PREMIUM;

const STRIPE_PRICE_FEATURED_BOOST = process.env.STRIPE_PRICE_FEATURED_BOOST;
const STRIPE_PRICE_SOCIAL_PROMOTION = process.env.STRIPE_PRICE_SOCIAL_PROMOTION;
const STRIPE_PRICE_EMAIL_BLAST = process.env.STRIPE_PRICE_EMAIL_BLAST;

type PriceKey =
  | "standard"
  | "featured"
  | "basic_monthly"
  | "basic_annual"
  | "professional_monthly"
  | "professional_annual"
  | "enterprise_monthly"
  | "enterprise_annual"
  | "credits_starter"
  | "credits_standard"
  | "credits_premium"
  | "featured_boost"
  | "social_promotion"
  | "email_blast";

const PRICE_MAP: Record<PriceKey, string | undefined> = {
  standard: STRIPE_PRICE_STANDARD,
  featured: STRIPE_PRICE_FEATURED,
  basic_monthly: STRIPE_PRICE_BASIC_MONTHLY,
  basic_annual: STRIPE_PRICE_BASIC_ANNUAL,
  professional_monthly: STRIPE_PRICE_PROFESSIONAL_MONTHLY,
  professional_annual: STRIPE_PRICE_PROFESSIONAL_ANNUAL,
  enterprise_monthly: STRIPE_PRICE_ENTERPRISE_MONTHLY,
  enterprise_annual: STRIPE_PRICE_ENTERPRISE_ANNUAL,
  credits_starter: STRIPE_PRICE_CREDITS_STARTER,
  credits_standard: STRIPE_PRICE_CREDITS_STANDARD,
  credits_premium: STRIPE_PRICE_CREDITS_PREMIUM,
  featured_boost: STRIPE_PRICE_FEATURED_BOOST,
  social_promotion: STRIPE_PRICE_SOCIAL_PROMOTION,
  email_blast: STRIPE_PRICE_EMAIL_BLAST,
};

export function resolveStripePrice(key: PriceKey): string | null {
  const priceId = PRICE_MAP[key];
  if (!priceId) {
    console.error(`[Stripe] Missing price ID for: ${key}`);
    return null;
  }
  return priceId;
}

export function requiredStripePrice(key: PriceKey): string {
  const priceId = resolveStripePrice(key);
  if (!priceId) {
    throw new Error(`Stripe price not configured: ${key}`);
  }
  return priceId;
}

const LISTING_PRICE_MAP: Record<string, PriceKey> = {
  standard: "standard",
  featured: "featured",
};

const PLAN_PRICE_MAP: Record<string, PriceKey> = {
  basic_monthly: "basic_monthly",
  basic_annual: "basic_annual",
  professional_monthly: "professional_monthly",
  professional_annual: "professional_annual",
  enterprise_monthly: "enterprise_monthly",
  enterprise_annual: "enterprise_annual",
};

const PACK_PRICE_MAP: Record<string, PriceKey> = {
  starter: "credits_starter",
  standard: "credits_standard",
  premium: "credits_premium",
};

const BUNDLE_PRICE_MAP: Record<string, PriceKey> = {
  featuredBoost: "featured_boost",
  socialPromotion: "social_promotion",
  emailBlast: "email_blast",
};

export function resolveListingPrice(listingType: string): string | null {
  const key = LISTING_PRICE_MAP[listingType];
  return key ? resolveStripePrice(key) : null;
}

export function resolvePlanPrice(
  planType: string,
  billingCycle: "monthly" | "annual"
): string | null {
  const mapKey = `${planType}_${billingCycle}`;
  const key = PLAN_PRICE_MAP[mapKey];
  return key ? resolveStripePrice(key) : null;
}

export function resolvePackPrice(packType: string): string | null {
  const key = PACK_PRICE_MAP[packType];
  return key ? resolveStripePrice(key) : null;
}

export function resolveBundlePrice(bundleType: string): string | null {
  const key = BUNDLE_PRICE_MAP[bundleType];
  return key ? resolveStripePrice(key) : null;
}
