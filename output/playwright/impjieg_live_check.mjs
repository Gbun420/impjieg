import { chromium } from "playwright";
import fs from "fs/promises";

const BASE_URL = "https://impjieg.vercel.app";
const EMAIL = "bundyglenn@gmail.com";
const PASSWORD = "Floyd420!";
const OUT_DIR = "output/playwright/impjieg-live-check";
const EMPLOYER_PAGES = [
  ["/employer/dashboard", "01-employer-dashboard"],
  ["/employer/jobs", "02-employer-jobs"],
  ["/employer/post-job", "03-post-job"],
  ["/employer/bulk-upload", "04-bulk-upload"],
  ["/employer/applications", "05-applications"],
  ["/employer/settings", "06-settings"],
];

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
  logs.push(`[${name}] url=${page.url()}`);
  logs.push(`[${name}] heading=${heading || "(none)"}`);
  console.log(`${path} heading:`, heading || "(none)");
  await snapshot(page, name);
}

async function main() {
  await ensureDir(OUT_DIR);
  const browser = await chromium.launch({ headless: true });
  const logs = [];

  try {
    for (const [label, viewport, prefix] of [
      ["employer-desktop", { width: 1440, height: 1600 }, ""],
      ["employer-mobile", { width: 390, height: 844 }, "m-"],
    ]) {
      console.log(`Starting ${label} audit...`);
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      attachLogging(page, label, logs);

      console.log("Checking login page...");
      await page.goto(`${BASE_URL}/auth/login`, { waitUntil: "networkidle" });
      await page.fill('input[name="email"]', EMAIL);
      await page.fill('input[name="password"]', PASSWORD);
      await Promise.all([
        page.waitForURL("**/employer/dashboard", { timeout: 15000 }),
        page.click('button[type="submit"]'),
      ]);
      console.log("Logged in at:", page.url());
      logs.push(`[${label}] login-landing=${page.url()}`);
      await snapshot(page, `${prefix}00-after-login`);

      if (label === "employer-mobile") {
        const menuButton = page.getByRole("button", { name: /Toggle menu/ });
        const visible = await menuButton.isVisible().catch(() => false);
        console.log("Mobile menu button visible:", visible);
        if (visible) {
          await menuButton.click();
          await snapshot(page, `${prefix}00-menu-open`);
          await menuButton.click().catch(() => {});
        }
      }

      const expectedNav = ["Dashboard", "My Jobs", "Post a Job", "Applications", "Settings"];
      for (const navLabel of expectedNav) {
        const visible = await page.getByRole("link", { name: navLabel }).first().isVisible().catch(() => false);
        console.log(`Nav "${navLabel}":`, visible ? "visible" : "missing");
      }

      for (const [path, name] of EMPLOYER_PAGES) {
        await auditPage(page, path, `${prefix}${name}`, logs);
      }

      const jobLinks = await page
        .locator('a[href*="/employer/jobs/"]')
        .evaluateAll((els) => els.map((el) => el.getAttribute("href")).filter(Boolean))
        .catch(() => []);
      console.log("Employer job links:", JSON.stringify(jobLinks, null, 2));

      const analyticsHref = jobLinks.find((href) => href?.includes("/analytics")) || null;
      const reportHref = jobLinks.find((href) => href?.includes("/report")) || null;
      if (analyticsHref) {
        console.log("Checking analytics route:", analyticsHref);
        await page.goto(`${BASE_URL}${analyticsHref}`, { waitUntil: "networkidle" });
        await snapshot(page, `${prefix}07-analytics`);
        console.log("Analytics heading:", await page.locator("h1").first().textContent().catch(() => ""));
      }
      if (reportHref) {
        console.log("Checking report route:", reportHref);
        await page.goto(`${BASE_URL}${reportHref}`, { waitUntil: "networkidle" });
        await snapshot(page, `${prefix}08-report`);
        console.log("Report heading:", await page.locator("h1").first().textContent().catch(() => ""));
      }

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
