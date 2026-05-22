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

test("getSupabaseUrl falls back to the project default when unset", () => {
  assert.equal(
    getSupabaseUrl(""),
    "https://vmdjxomkmcbewtcyfrlp.supabase.co"
  );
});

test("getSupabaseAnonKey falls back to the project public anon key when unset", () => {
  assert.match(getSupabaseAnonKey(""), /^eyJhbGciOiJIUzI1Ni/);
});

test("hasSupabasePublicEnv reports availability when either configured or fallback values exist", () => {
  assert.equal(hasSupabasePublicEnv(), true);
});
