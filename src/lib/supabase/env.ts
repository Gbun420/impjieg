const DEFAULT_SUPABASE_URL = "https://vmdjxomkmcbewtcyfrlp.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtZGp4b21rbWNiZXd0Y3lmcmxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMjUzODcsImV4cCI6MjA5NDcwMTM4N30.s72VM35a2IJruX_kBe7NEts48A5qg2BgDmEmawlCE9A";

export function getSupabaseUrl(value = process.env.NEXT_PUBLIC_SUPABASE_URL) {
  return value || DEFAULT_SUPABASE_URL;
}

export function getSupabaseAnonKey(
  value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
) {
  return value || DEFAULT_SUPABASE_ANON_KEY;
}

export function hasSupabasePublicEnv() {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}
