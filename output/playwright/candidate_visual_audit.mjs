import { chromium } from "playwright";
import fs from "fs/promises";

const BASE_URL = "https://impjieg.vercel.app";
const EMAIL = "bundyglenn@gmail.com";
const PASSWORD = "Floyd420!";
const OUT_DIR = "output/playwright/candidate-visual-audit";

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

function attachLogging(page, label, logs) {
  page.on("console", (msg) => {
    const text = `[${label} console:${msg.type()}] ${msg.text()}`;
    logs.push(text);
    if (msg.type() === "error") console.log(text);
  });
  page.on("pageerror", (err) => {
    const text = `[${label} pageerror] ${err.message}`;
    logs.push(text);
    console.log(text);
  });
}

async function snapshot(page, name) {
  await page.screenshot({ path: `${OUT_DIR}/${name}.png`, fullPage: true });
}

async function auditPage(page, path, name, logs) {
  console.log(`Opening ${path}...`);
  await page.goto(`${BASE_URL}${path}`, { waitUntil: "networkidle" });
  console.log(`${path} landed at:`, page.url());
  const heading = await page.locator("h1").first().textContent().catch(() => "");
  console.log(`${path} heading:`, heading || "(none)");
  logs.push(`[${name}] url=${page.url()}`);
  logs.push(`[${name}] heading=${heading || "(none)"}`);
  await snapshot(page, name);
}

async function main() {
  await ensureDir(OUT_DIR);
  const browser = await chromium.launch({
    headless: true,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const logs = [];

  try {
    for (const [label, viewport, prefix] of [
      ["desktop", { width: 1440, height: 1600 }, ""],
      ["mobile", { width: 390, height: 844 }, "m-"],
    ]) {
      console.log(`Starting ${label} audit...`);
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      attachLogging(page, `candidate-${label}`, logs);

      console.log("Logging in...");
      await page.goto(`${BASE_URL}/auth/login`, { waitUntil: "networkidle" });
      await page.fill('input[name="email"]', EMAIL);
      await page.fill('input[name="password"]', PASSWORD);
      await Promise.all([
        page.waitForURL("**/employer/dashboard", { timeout: 15000 }),
        page.click('button[type="submit"]'),
      ]);
      console.log("Logged in at:", page.url());
      await snapshot(page, `${prefix}01-after-login`);

      await auditPage(page, "/candidate/dashboard", `${prefix}02-candidate-dashboard`, logs);
      await auditPage(page, "/candidate/profile", `${prefix}03-candidate-profile`, logs);
      await auditPage(page, "/candidate/applications", `${prefix}04-candidate-applications`, logs);
      await auditPage(page, "/candidate/alerts", `${prefix}05-candidate-alerts`, logs);
      await auditPage(page, "/candidate/recommendations", `${prefix}06-candidate-recommendations`, logs);

      console.log("Opening saved jobs...");
      await page.goto(`${BASE_URL}/saved-jobs`, { waitUntil: "networkidle" });
      console.log("/saved-jobs landed at:", page.url());
      await snapshot(page, `${prefix}07-saved-jobs`);

      await context.close();
    }
  } finally {
    await browser.close();
    await fs.writeFile(`${OUT_DIR}/logs.txt`, logs.join("\n") + "\n");
  }
}

main().catch(async (err) => {
  console.error(err);
  process.exitCode = 1;
});
