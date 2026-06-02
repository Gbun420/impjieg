import test from "node:test";
import assert from "node:assert/strict";
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  hasSupabasePublicEnv,
} from "./env";

test("getSupabaseUrl prefers configured environment values", () => {
  assert.equal(
    getSupabaseUrl("https://custom.supabase.co"),
    "https://custom.supabase.co"
  );
});

test("getSupabaseUrl throws when the public Supabase URL is missing", () => {
  assert.throws(() => getSupabaseUrl(""), /NEXT_PUBLIC_SUPABASE_URL/);
});

test("getSupabaseAnonKey throws when the public Supabase anon key is missing", () => {
  assert.throws(() => getSupabaseAnonKey(""), /NEXT_PUBLIC_SUPABASE_ANON_KEY/);
});

test("hasSupabasePublicEnv reports whether the public Supabase config is present", () => {
  const backupUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const backupAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  assert.equal(hasSupabasePublicEnv(), false);

  process.env.NEXT_PUBLIC_SUPABASE_URL = backupUrl;
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = backupAnonKey;
});
