const DEV_ENV_FALLBACKS: Record<string, string> = {
  CRON_SECRET: "dev-cron-secret",
  GROQ_API_KEY: "dev-groq-api-key",
  INTERNAL_ADMIN_TOKEN: "local-admin",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "dev-supabase-anon-key",
  NEXT_PUBLIC_SUPABASE_URL: "https://dev.supabase.co",
  NEXT_PUBLIC_URL: "http://localhost:3000",
  RESEND_API_KEY: "dev-resend-api-key",
  STRIPE_PRICE_FEATURED: "price_dev_featured",
  STRIPE_PRICE_STANDARD: "price_dev_standard",
  STRIPE_PUBLISHABLE_KEY: "pk_test_dev",
  STRIPE_SECRET_KEY: "sk_test_dev",
  STRIPE_WEBHOOK_SECRET: "whsec_dev",
  SUPABASE_SERVICE_ROLE_KEY: "dev-supabase-service-key",
  TWILIO_ACCOUNT_SID: "ACdev",
  TWILIO_AUTH_TOKEN: "dev-twilio-auth-token",
  TWILIO_WHATSAPP_NUMBER: "+10000000000",
};

export function requireEnv(name: string, value = process.env[name]) {
  if (!value) {
    if (process.env.NODE_ENV !== "production") {
      return DEV_ENV_FALLBACKS[name] ?? `dev-${name.toLowerCase()}`;
    }

    throw new Error(`${name} is required`);
  }

  return value;
}
