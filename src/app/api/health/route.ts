import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseServiceKey, getSupabaseUrl } from "@/lib/supabase/env";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export const runtime = "edge";

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version ?? "unknown",
    services: {} as Record<string, { status: "healthy" | "degraded" | "down"; latencyMs?: number; error?: string }>,
  };

  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    const start = Date.now();
    try {
      const supabase = createServiceClient(supabaseUrl, supabaseAnonKey);
      const { error } = await supabase.from("jobs").select("id").limit(1);
      checks.services.supabase = {
        status: error ? "degraded" : "healthy",
        latencyMs: Date.now() - start,
        error: error?.message,
      };
    } catch (err) {
      checks.services.supabase = {
        status: "down",
        latencyMs: Date.now() - start,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  } else {
    checks.services.supabase = { status: "down", error: "Missing Supabase config" };
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const start = Date.now();
    try {
      const response = await fetch("https://api.resend.com/domains", {
        headers: { Authorization: `Bearer ${resendKey}` },
        method: "GET",
      });
      checks.services.resend = {
        status: response.ok ? "healthy" : "degraded",
        latencyMs: Date.now() - start,
        error: response.ok ? undefined : `HTTP ${response.status}`,
      };
    } catch (err) {
      checks.services.resend = {
        status: "down",
        latencyMs: Date.now() - start,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  } else {
    checks.services.resend = { status: "down", error: "Missing RESEND_API_KEY" };
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (stripeKey) {
    const start = Date.now();
    try {
      const response = await fetch("https://api.stripe.com/v1/account", {
        headers: { Authorization: `Bearer ${stripeKey}` },
        method: "GET",
      });
      checks.services.stripe = {
        status: response.ok ? "healthy" : "degraded",
        latencyMs: Date.now() - start,
        error: response.ok ? undefined : `HTTP ${response.status}`,
      };
    } catch (err) {
      checks.services.stripe = {
        status: "down",
        latencyMs: Date.now() - start,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  } else {
    checks.services.stripe = { status: "down", error: "Missing STRIPE_SECRET_KEY" };
  }

  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    const start = Date.now();
    try {
      const response = await fetch("https://api.groq.com/openai/v1/models", {
        headers: { Authorization: `Bearer ${groqKey}` },
        method: "GET",
      });
      checks.services.groq = {
        status: response.ok ? "healthy" : "degraded",
        latencyMs: Date.now() - start,
        error: response.ok ? undefined : `HTTP ${response.status}`,
      };
    } catch (err) {
      checks.services.groq = {
        status: "down",
        latencyMs: Date.now() - start,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  } else {
    checks.services.groq = { status: "down", error: "Missing GROQ_API_KEY" };
  }

  const allHealthy = Object.values(checks.services).every((s) => s.status === "healthy");
  const anyDown = Object.values(checks.services).some((s) => s.status === "down");

  return NextResponse.json(checks, {
    status: allHealthy ? 200 : anyDown ? 503 : 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}