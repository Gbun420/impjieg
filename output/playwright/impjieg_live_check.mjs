import { chromium } from "playwright";
import fs from "fs/promises";

const BASE_URL = "https://impjieg.vercel.app";
const EMAIL = "bundyglenn@gmail.com";
const PASSWORD = "Floyd420!";
const OUT_DIR = "output/playwright/impjieg-live-check";

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

async function main() {
  await ensureDir(OUT_DIR);
  const browser = await chromium.launch({ headless: true });
  const logs = [];

  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1600 },
    });
    const page = await context.newPage();
    attachLogging(page, "employer", logs);

    console.log("Checking login page...");
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: "networkidle" });
    await page.fill('input[name="email"]', EMAIL);
    await page.fill('input[name="password"]', PASSWORD);
    await Promise.all([
      page.waitForURL("**/employer/dashboard", { timeout: 15000 }),
      page.click('button[type="submit"]'),
    ]);
    console.log("Logged in at:", page.url());
    console.log("Dashboard heading:", await page.locator("h1").first().textContent());
    await snapshot(page, "01-employer-dashboard");

    const expectedNav = ["Dashboard", "My Jobs", "Post a Job", "Applications", "Settings"];
    for (const label of expectedNav) {
      const visible = await page.getByRole("link", { name: label }).first().isVisible();
      console.log(`Nav "${label}":`, visible ? "visible" : "missing");
    }

    console.log("Checking employer jobs...");
    await page.goto(`${BASE_URL}/employer/jobs`, { waitUntil: "networkidle" });
    console.log("Jobs page heading:", await page.locator("h1").first().textContent());
    await snapshot(page, "02-employer-jobs");

    const jobLinks = await page
      .locator('a[href*="/employer/jobs/"]')
      .evaluateAll((els) => els.map((el) => el.getAttribute("href")).filter(Boolean));
    console.log("Employer job links:", JSON.stringify(jobLinks, null, 2));

    if (jobLinks.length > 0) {
      const analyticsHref = jobLinks.find((href) => href?.includes("/analytics")) || null;
      if (analyticsHref) {
        console.log("Checking analytics route:", analyticsHref);
        await page.goto(`${BASE_URL}${analyticsHref}`, { waitUntil: "networkidle" });
        await snapshot(page, "03-employer-analytics");
        console.log("Analytics heading:", await page.locator("h1").first().textContent());
      } else {
        console.log("No analytics link surfaced from jobs page.");
      }
    }

    console.log("Checking post job page...");
    await page.goto(`${BASE_URL}/employer/post-job`, { waitUntil: "networkidle" });
    await snapshot(page, "04-post-job");
    const postJobFields = ["Job Title", "Location", "Description"];
    for (const label of postJobFields) {
      const fieldVisible = await page.getByLabel(label).first().isVisible().catch(() => false);
      console.log(`Field "${label}":`, fieldVisible ? "visible" : "missing");
    }

    console.log("Checking applications page...");
    await page.goto(`${BASE_URL}/employer/applications`, { waitUntil: "networkidle" });
    await snapshot(page, "05-applications");
    console.log("Applications heading:", await page.locator("h1").first().textContent());

    console.log("Checking settings page...");
    await page.goto(`${BASE_URL}/employer/settings`, { waitUntil: "networkidle" });
    await snapshot(page, "06-settings");
    console.log("Settings heading:", await page.locator("h1").first().textContent());

    await context.close();

    const anonContext = await browser.newContext({
      viewport: { width: 1440, height: 1600 },
    });
    const anonPage = await anonContext.newPage();
    attachLogging(anonPage, "candidate", logs);

    console.log("Checking candidate dashboard redirect...");
    await anonPage.goto(`${BASE_URL}/candidate/dashboard`, { waitUntil: "networkidle" });
    await snapshot(anonPage, "07-candidate-dashboard");
    console.log("Candidate dashboard landed at:", anonPage.url());
    console.log(
      "Candidate page heading:",
      await anonPage.locator("h1").first().textContent().catch(() => "")
    );

    await anonContext.close();
  } finally {
    await browser.close();
    await fs.writeFile(`${OUT_DIR}/logs.txt`, logs.join("\n") + "\n");
  }
}

main().catch(async (err) => {
  console.error(err);
  process.exitCode = 1;
});
