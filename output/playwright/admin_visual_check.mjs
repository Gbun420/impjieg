import { chromium } from "playwright";
import fs from "fs/promises";
import path from "path";

const BASE_URL = "http://localhost:3000";
const OUT_DIR = "output/playwright/admin-visual-check";

function parseEnvFile(raw) {
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const normalized = trimmed.startsWith("export ")
      ? trimmed.slice("export ".length)
      : trimmed;
    const eqIndex = normalized.indexOf("=");
    if (eqIndex === -1) continue;
    const key = normalized.slice(0, eqIndex).trim();
    let value = normalized.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

async function getAdminToken() {
  if (process.env.INTERNAL_ADMIN_TOKEN) {
    return process.env.INTERNAL_ADMIN_TOKEN;
  }

  const candidates = [
    process.env.ADMIN_ENV_FILE,
    "/private/tmp/impjieg.production.env",
    path.join(process.cwd(), ".env.local"),
  ].filter(Boolean);

  for (const envPath of candidates) {
    try {
      const raw = await fs.readFile(envPath, "utf8");
      const env = parseEnvFile(raw);
      if (env.INTERNAL_ADMIN_TOKEN) {
        return env.INTERNAL_ADMIN_TOKEN;
      }
    } catch {
      // Try the next candidate.
    }
  }

  if (process.env.NODE_ENV !== "production") {
    return "local-admin";
  }

  throw new Error("INTERNAL_ADMIN_TOKEN could not be found in any env file");
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function main() {
  await ensureDir(OUT_DIR);
  const token = await getAdminToken();
  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1800 } });
    const page = await context.newPage();

    page.on("pageerror", (error) => {
      console.log("[pageerror]", error.message);
    });
    page.on("console", (message) => {
      if (message.type() === "error") {
        console.log("[console:error]", message.text());
      }
    });

    console.log("Opening admin login...");
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: "networkidle" });
    await page.screenshot({ path: `${OUT_DIR}/01-login.png`, fullPage: true });

    console.log("Logging in...");
    await page.fill('input[name="password"]', token);
    await Promise.all([
      page.waitForURL("**/admin/dashboard", { timeout: 15000 }),
      page.click('button[type="submit"]'),
    ]);

    console.log("Logged in at:", page.url());
    console.log("Headline:", await page.locator("h1").first().textContent());
    await page.screenshot({ path: `${OUT_DIR}/02-dashboard.png`, fullPage: true });

    await context.close();
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
