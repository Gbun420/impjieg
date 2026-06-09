import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Validate Supabase admin env vars (service_role key)
// Usage: tsx scripts/check-supabase-admin-env.ts
// Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
//
// Safety: Never prints keys, auth headers, or secrets.
// ---------------------------------------------------------------------------

function loadLocalEnv() {
  const fs = require("node:fs");
  const path = require("node:path");
  const candidates = [".env.local", ".env.production"];
  for (const file of candidates) {
    const filePath = path.resolve(process.cwd(), file);
    if (!fs.existsSync(filePath)) continue;
    const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      if (!key || process.env[key]) continue;
      let value = line.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}

loadLocalEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function printResult(host: string, status: "OK" | "FAIL", message: string) {
  console.log(`Project: ${host}`);
  console.log(`Status:  ${status}`);
  if (message) console.log(`Message: ${message}`);
}

async function main() {
  if (!supabaseUrl) {
    printResult("(unknown)", "FAIL", "Missing NEXT_PUBLIC_SUPABASE_URL in .env.local");
    process.exit(1);
  }

  if (!serviceKey) {
    printResult(new URL(supabaseUrl).host, "FAIL", "Missing SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const host = new URL(supabaseUrl).host;

  // Validate key format (must be a JWT)
  const keyParts = serviceKey.split(".");
  if (keyParts.length !== 3) {
    printResult(host, "FAIL", "SUPABASE_SERVICE_ROLE_KEY is not a valid JWT format");
    process.exit(1);
  }

  // Decode payload to check role (without exposing the key)
  try {
    const payload = JSON.parse(Buffer.from(keyParts[1], "base64url").toString());
    if (payload.role !== "service_role") {
      printResult(host, "FAIL", `Key role is "${payload.role}" but expected "service_role"`);
      process.exit(1);
    }
    if (payload.ref && !host.startsWith(payload.ref)) {
      printResult(host, "FAIL", `Key ref "${payload.ref}" does not match project host`);
      process.exit(1);
    }
  } catch {
    printResult(host, "FAIL", "Could not decode key payload");
    process.exit(1);
  }

  // Try a query to verify the key works
  const supabase = createClient(supabaseUrl, serviceKey);

  const { error } = await supabase.from("employers").select("id").limit(1);

  if (error) {
    if (error.message?.includes("Invalid API key")) {
      printResult(host, "FAIL", "Key is invalid or rotated. Get a fresh service_role key from Supabase Dashboard → Project Settings → API Keys");
    } else if (error.message?.includes("Could not find the table")) {
      printResult(host, "OK", "Key is valid but employers table not found (may be expected)");
    } else {
      printResult(host, "OK", `Key is valid (query returned: ${error.message})`);
    }
    process.exit(error.message?.includes("Invalid API key") ? 1 : 0);
  }

  printResult(host, "OK", "Service role key is valid and can query the database");
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
