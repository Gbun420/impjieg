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
  // requireEnv only throws outside development (it returns a dev fallback
  // otherwise), so force production to assert the missing-config behaviour.
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";

  try {
    assert.throws(() => getSupabaseUrl(""), /NEXT_PUBLIC_SUPABASE_URL/);
  } finally {
    process.env.NODE_ENV = previousNodeEnv;
  }
});

test("getSupabaseAnonKey throws when the public Supabase anon key is missing", () => {
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";

  try {
    assert.throws(() => getSupabaseAnonKey(""), /NEXT_PUBLIC_SUPABASE_ANON_KEY/);
  } finally {
    process.env.NODE_ENV = previousNodeEnv;
  }
});

test("hasSupabasePublicEnv reports whether the public Supabase config is present", () => {
  const backupUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const backupAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  assert.equal(hasSupabasePublicEnv(), false);

  if (backupUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  } else {
    process.env.NEXT_PUBLIC_SUPABASE_URL = backupUrl;
  }

  if (backupAnonKey === undefined) {
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  } else {
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = backupAnonKey;
  }
});
