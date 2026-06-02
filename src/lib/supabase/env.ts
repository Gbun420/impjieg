import { requireEnv } from "@/lib/runtime-env";

export function getSupabaseUrl(value = process.env.NEXT_PUBLIC_SUPABASE_URL) {
  return requireEnv("NEXT_PUBLIC_SUPABASE_URL", value);
}

export function getSupabaseAnonKey(
  value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
) {
  return requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", value);
}

export function getSupabaseServiceKey(
  value = process.env.SUPABASE_SERVICE_ROLE_KEY
) {
  return requireEnv("SUPABASE_SERVICE_ROLE_KEY", value);
}

export function hasSupabasePublicEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
