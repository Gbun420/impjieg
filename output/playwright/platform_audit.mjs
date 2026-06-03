import { chromium } from "playwright";
import fs from "fs/promises";

const BASE_URL = "https://impjieg.vercel.app";
const EMAIL = "bundyglenn@gmail.com";
const PASSWORD = "Floyd420!";
const OUT_DIR = "output/playwright/platform-audit";

const PUBLIC_PAGES = [
  ["/", "00-home"],
  ["/jobs", "01-jobs"],
  ["/companies", "02-companies"],
  ["/pricing", "03-pricing"],
  ["/contact", "04-contact"],
  ["/blog", "05-blog"],
  ["/login", "06-login-alias"],
  ["/signup", "07-signup-alias"],
  ["/salary-calculator", "08-salary-calculator"],
  ["/privacy-policy", "09-privacy-policy"],
  ["/terms-of-service", "10-terms-of-service"],
  ["/cookie-policy", "11-cookie-policy"],
];

const PROTECTED_PAGES = [
  ["/saved-jobs", "12-saved-jobs-redirect"],
  ["/candidate/dashboard", "13-candidate-dashboard-redirect"],
  ["/candidate/profile", "14-candidate-profile-redirect"],
  ["/candidate/alerts", "15-candidate-alerts-redirect"],
  ["/candidate/recommendations", "16-candidate-recommendations-redirect"],
];

const EMPLOYER_PAGES = [
  ["/employer/dashboard", "20-employer-dashboard"],
  ["/employer/jobs", "21-employer-jobs"],
  ["/employer/post-job", "22-post-job"],
  ["/employer/bulk-upload", "23-bulk-upload"],
  ["/employer/applications", "24-applications"],
  ["/employer/settings", "25-settings"],
];

function launchBrowser() {
  return chromium.launch({ headless: true }).catch(async () => {
    return chromium.launch({ headless: true });
  });
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

function attachLogging(page, label, logs) {
  page.on("console", (msg) => {
    const text = `[${label} console:${msg.type()}] ${msg.text()}`;
    logs.push(text);
  });
  page.on("pageerror", (err) => {
    const text = `[${label} pageerror] ${err.message}`;
    logs.push(text);
  });
  page.on("response", (res) => {
    const url = res.url();
    if (url.startsWith(`${BASE_URL}/api/`)) {
      logs.push(`[${label} api] ${res.status()} ${new URL(url).pathname}`);
    }
  });
}

async function shot(page, name) {
  await page.screenshot({ path: `${OUT_DIR}/${name}.png`, fullPage: true });
}

async function pageSummary(page, label, logs) {
  const heading = await page.locator("h1").first().textContent().catch(() => "");
  const title = await page.title().catch(() => "");
  logs.push(`[${label}] url=${page.url()}`);
  logs.push(`[${label}] title=${title || "(none)"}`);
  logs.push(`[${label}] heading=${heading || "(none)"}`);
}

async function auditRoute(page, path, label, logs, { expectRedirect = false } = {}) {
  await page.goto(`${BASE_URL}${path}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  await pageSummary(page, label, logs);
  await shot(page, label);
  if (expectRedirect && !page.url().includes("/auth/login")) {
    throw new Error(`Expected redirect for ${path}, got ${page.url()}`);
  }
}

async function loginAsEmployer(page, logs, prefix) {
  await page.goto(`${BASE_URL}/auth/login`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', PASSWORD);
  await Promise.all([
    page.waitForURL("**/employer/dashboard", { timeout: 20000 }),
    page.click('button[type="submit"]'),
  ]);
  await pageSummary(page, `${prefix}login-success`, logs);
  await shot(page, `${prefix}login-success`);
}

async function auditNavigation(page, logs, prefix) {
  const navLabels = ["Jobs", "Companies", "Pricing", "Login", "Post a Job"];
  for (const label of navLabels) {
    const visible = await page.getByRole("link", { name: label }).first().isVisible().catch(() => false);
    logs.push(`[${prefix}nav] ${label}=${visible}`);
  }
}

async function apiCheck(path, init, logs, label, expectStatus) {
  const response = await fetch(`${BASE_URL}${path}`, init);
  const text = await response.text();
  logs.push(`[${label}] status=${response.status} path=${path}`);
  if (expectStatus && response.status !== expectStatus) {
    throw new Error(`Expected ${expectStatus} for ${path}, got ${response.status}`);
  }
  return { response, text };
}

async function main() {
  await ensureDir(OUT_DIR);
  const logs = [];
  const browser = await launchBrowser();

  try {
    // Public surface
    for (const [path, label] of PUBLIC_PAGES) {
      console.log(`Public: ${path}`);
      const context = await browser.newContext({ viewport: { width: 1440, height: 1600 } });
      const page = await context.newPage();
      attachLogging(page, label, logs);
      await auditRoute(page, path, label, logs);
      if (path === "/jobs") {
        const jobLink = page.locator('a[href^="/jobs/"]').first();
        const visible = await jobLink.isVisible().catch(() => false);
        logs.push(`[${label}] first-job-link-visible=${visible}`);
        if (visible) {
          await page.waitForTimeout(500);
          await Promise.all([
            page.waitForURL(/\/jobs\/.+\/.+/),
            jobLink.click(),
          ]);
          await pageSummary(page, "01-job-detail", logs);
          await shot(page, "01-job-detail");
        }
      }
      if (path === "/") {
        await auditNavigation(page, logs, "home-");
      }
      await context.close();
    }

    // Protected routes should redirect when not signed in
    for (const [path, label] of PROTECTED_PAGES) {
      console.log(`Protected redirect: ${path}`);
      const context = await browser.newContext({ viewport: { width: 1440, height: 1600 } });
      const page = await context.newPage();
      attachLogging(page, label, logs);
      await auditRoute(page, path, label, logs, { expectRedirect: true });
      await context.close();
    }

    // Auth flow
    {
      console.log("Employer auth flow");
      const context = await browser.newContext({ viewport: { width: 1440, height: 1600 } });
      const page = await context.newPage();
      attachLogging(page, "auth", logs);
      await auditRoute(page, "/auth/login", "26-auth-login", logs);
      await loginAsEmployer(page, logs, "27-");
      await auditNavigation(page, logs, "employer-");

      for (const [path, label] of EMPLOYER_PAGES) {
        await auditRoute(page, path, label, logs);
      }

      const analyticsLink = await page.locator('a[href*="/analytics"]').first().getAttribute("href").catch(() => null);
      const reportLink = await page.locator('a[href*="/report"]').first().getAttribute("href").catch(() => null);
      logs.push(`[employer-links] analytics=${analyticsLink || "(none)"}`);
      logs.push(`[employer-links] report=${reportLink || "(none)"}`);
      if (analyticsLink) {
        await auditRoute(page, analyticsLink, "30-analytics", logs);
      }
      if (reportLink) {
        await auditRoute(page, reportLink, "31-report", logs);
      }

      await context.close();
    }

    // API checks
    console.log("API checks");
    await apiCheck("/api/jobs/feed", { method: "GET" }, logs, "api-jobs-feed", 200);
    {
      const { response, text } = await apiCheck("/api/jobs/rss", { method: "GET" }, logs, "api-jobs-rss", 200);
      if (!text.includes("<rss")) {
        throw new Error("RSS response does not contain <rss");
      }
      logs.push(`[api-jobs-rss] content-type=${response.headers.get("content-type") || "(none)"}`);
    }
    await apiCheck(
      "/api/contact",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      },
      logs,
      "api-contact-invalid",
      400
    );
    await apiCheck("/api/candidate/alerts", { method: "GET" }, logs, "api-candidate-alerts-unauth", 401);
    await apiCheck("/api/admin/provision", { method: "GET" }, logs, "api-admin-provision-forbidden", 403);
    await apiCheck("/api/webhooks/stripe", { method: "POST" }, logs, "api-webhooks-stripe-missing-signature", 400);
  } finally {
    await browser.close();
    await fs.writeFile(`${OUT_DIR}/logs.txt`, logs.join("\n") + "\n");
  }
}

main().catch(async (err) => {
  console.error(err);
  process.exitCode = 1;
});
