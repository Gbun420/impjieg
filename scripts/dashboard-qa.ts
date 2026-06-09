import puppeteer, { type Browser, type Page, type ConsoleMessage, type HTTPResponse } from "puppeteer";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// ---------------------------------------------------------------------------
// Dashboard QA Test Suite
// Uses Puppeteer for functional testing + Lighthouse for performance/a11y
// Usage: npx tsx scripts/dashboard-qa.ts
// ---------------------------------------------------------------------------

const BASE_URL = process.env.BASE_URL || "https://impjieg.vercel.app";
const QA_PASSWORD = "ImpjiegQA!2026-DoNotUseReal";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const CREDENTIALS = {
  candidate: { email: "qa.candidate+dashboard@impjieg.test", password: QA_PASSWORD },
  employer: { email: "qa.employer+dashboard@impjieg.test", password: QA_PASSWORD },
  admin: { email: "qa.admin+dashboard@impjieg.test", password: QA_PASSWORD },
};

type Severity = "P0" | "P1" | "P2" | "P3";

interface RouteResult {
  url: string;
  account: string;
  loaded: boolean;
  httpStatus: number;
  consoleErrors: string[];
  networkErrors: string[];
  brokenButtons: string[];
  formIssues: string[];
  mobileIssues: string[];
  a11yIssues: string[];
  screenshot?: string;
  severity: Severity;
  notes: string;
}

const results: RouteResult[] = [];

// ---------- helpers ----------

function emptyResult(url: string, account: string): RouteResult {
  return {
    url,
    account,
    loaded: false,
    httpStatus: 0,
    consoleErrors: [],
    networkErrors: [],
    brokenButtons: [],
    formIssues: [],
    mobileIssues: [],
    a11yIssues: [],
    severity: "P3",
    notes: "",
  };
}

async function login(page: Page, email: string, password: string): Promise<boolean> {
  try {
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: "networkidle2", timeout: 15000 });

    // Fill email
    await page.waitForSelector('input[name="email"]', { timeout: 5000 });
    await page.type('input[name="email"]', email, { delay: 10 });

    // Fill password
    await page.waitForSelector('input[name="password"]', { timeout: 5000 });
    await page.type('input[name="password"]', password, { delay: 10 });

    // Click submit and wait for navigation
    const currentUrl = page.url();
    await page.click('button[type="submit"]');

    // Wait for either navigation away from login or error message
    await sleep(3000);

    // Check if we're still on login page (error) or moved elsewhere
    const newUrl = page.url();
    const hasError = await page.$('[class*="error"], [role="alert"]');

    if (newUrl === currentUrl && hasError) {
      const errorText = await hasError.evaluate((el) => el.textContent?.trim() || "");
      console.log(`    Login error: ${errorText}`);
      return false;
    }

    return newUrl !== currentUrl || !newUrl.includes("/auth/login");
  } catch (err) {
    console.log(`    Login exception: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
}

async function loginAsAdminWithMFA(page: Page): Promise<boolean> {
  try {
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: "networkidle2", timeout: 15000 });

    // Fill admin email
    await page.waitForSelector('input[name="email"]', { timeout: 5000 });
    await page.type('input[name="email"]', CREDENTIALS.admin.email, { delay: 10 });

    // Fill password
    await page.waitForSelector('input[name="password"]', { timeout: 5000 });
    await page.type('input[name="password"]', CREDENTIALS.admin.password, { delay: 10 });

    // Click submit
    await page.click('button[type="submit"]');
    await sleep(3000);

    // Check if we're on MFA page
    if (page.url().includes("/mfa")) {
      console.log("  MFA page detected, entering TOTP code...");

      // Generate TOTP code
      const { execSync } = await import("node:child_process");
      const totpOutput = execSync("npx tsx scripts/generate-admin-qa-totp.ts", {
        cwd: process.cwd(),
        encoding: "utf-8",
        timeout: 15000,
      });
      const codeMatch = totpOutput.match(/\d{6}/);

      if (codeMatch) {
        // Find the TOTP input
        const totpInput = await page.$('input[name="code"], input[inputmode="numeric"], input[maxlength="6"]');
        if (totpInput) {
          await totpInput.type(codeMatch[0], { delay: 50 });
          await page.click('button[type="submit"]');
          await sleep(3000);
        } else {
          console.log("  Could not find TOTP input field");
          return false;
        }
      } else {
        console.log("  Could not generate TOTP code");
        return false;
      }
    }

    return page.url().includes("/admin/dashboard") || page.url().includes("/admin/");
  } catch (err) {
    console.log(`  Admin login error: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
}

async function collectConsoleErrors(page: Page, result: RouteResult) {
  page.on("console", (msg: ConsoleMessage) => {
    if (msg.type() === "error") {
      const text = msg.text();
      if (!text.includes("schema cache") && !text.includes("Warning: Invalid hook")) {
        result.consoleErrors.push(text.slice(0, 200));
      }
    }
  });
}

async function collectNetworkErrors(page: Page, result: RouteResult) {
  page.on("response", (resp: HTTPResponse) => {
    if (resp.status() >= 400 && !resp.url().includes("favicon")) {
      result.networkErrors.push(`${resp.status()} ${resp.url().slice(0, 120)}`);
    }
  });
}

async function checkBrokenButtons(page: Page, result: RouteResult) {
  try {
    const buttons = await page.$$eval("button, a[role='button'], [type='submit']", (els) =>
      els.map((el) => ({
        text: (el.textContent || "").trim().slice(0, 60),
        disabled: (el as HTMLButtonElement).disabled,
        ariaLabel: el.getAttribute("aria-label"),
        href: el.getAttribute("href"),
      }))
    );

    for (const btn of buttons) {
      if (btn.text && !btn.disabled) {
        // Check for Link><Button nesting pattern (forbidden)
        const parentLink = await page.$(`a:has(button)`);
        if (parentLink) {
          result.brokenButtons.push(`Link><Button nesting detected: "${btn.text}"`);
        }
      }
      // Check icon-only buttons without aria-label
      if (!btn.text && !btn.ariaLabel && !btn.href) {
        result.brokenButtons.push("Icon-only button missing aria-label");
      }
    }
  } catch {
    // Skip button check on error pages
  }
}

async function checkMobileLayout(page: Page, result: RouteResult) {
  try {
    await page.setViewport({ width: 375, height: 812 });
    await sleep(500);

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    if (hasHorizontalScroll) {
      result.mobileIssues.push("Horizontal scroll detected on mobile (375px)");
    }

    // Check for overlapping elements
    const overflowHidden = await page.evaluate(() => {
      const body = document.body;
      return body.scrollWidth > body.clientWidth + 10;
    });

    if (overflowHidden) {
      result.mobileIssues.push("Content overflows on mobile viewport");
    }

    await page.setViewport({ width: 1280, height: 800 });
  } catch {
    // Skip mobile check
  }
}

async function testRoute(
  page: Page,
  url: string,
  account: string,
  options: { requireAuth?: boolean; checkButtons?: boolean } = {}
): Promise<RouteResult> {
  const result = emptyResult(url, account);

  try {
    const response = await page.goto(`${BASE_URL}${url}`, {
      waitUntil: "networkidle2",
      timeout: 20000,
    });

    result.httpStatus = response?.status() ?? 0;
    result.loaded = result.httpStatus >= 200 && result.httpStatus < 400;

    // Check if redirected to login when auth required
    if (options.requireAuth && page.url().includes("/auth/login")) {
      result.loaded = false;
      result.notes = "Redirected to login (not authenticated)";
      result.severity = "P2";
      return result;
    }

    // Check if redirected to admin login for admin routes
    if (url.startsWith("/admin") && page.url().includes("/admin/login")) {
      result.loaded = false;
      result.notes = "Redirected to admin login";
      result.severity = "P2";
      return result;
    }

    if (result.loaded) {
      await sleep(1000);

      if (options.checkButtons !== false) {
        await checkBrokenButtons(page, result);
      }

      await checkMobileLayout(page, result);

      // Check for visible error states
      const errorState = await page.$('[class*="error"], [role="alert"]');
      if (errorState) {
        const errorText = await errorState.evaluate((el) => el.textContent?.trim() || "");
        if (errorText && !errorText.includes("no grants yet")) {
          result.formIssues.push(`Error state visible: "${errorText.slice(0, 100)}"`);
        }
      }

      // Check for broken images
      const brokenImages = await page.$$eval("img", (imgs) =>
        imgs.filter((img) => !img.complete || img.naturalWidth === 0).map((img) => img.alt || img.src)
      );
      if (brokenImages.length > 0) {
        result.brokenButtons.push(`Broken images: ${brokenImages.join(", ")}`);
      }

      // Check for missing alt text
      const imagesWithoutAlt = await page.$$eval("img:not([alt])", (imgs) => imgs.length);
      if (imagesWithoutAlt > 0) {
        result.a11yIssues.push(`${imagesWithoutAlt} images missing alt text`);
      }
    }

    // Determine severity
    if (!result.loaded && result.httpStatus >= 500) {
      result.severity = "P0";
    } else if (!result.loaded && result.httpStatus === 404) {
      result.severity = "P1";
    } else if (result.consoleErrors.length > 0 || result.networkErrors.length > 3) {
      result.severity = "P1";
    } else if (result.brokenButtons.length > 0 || result.mobileIssues.length > 0) {
      result.severity = "P2";
    } else if (result.formIssues.length > 0) {
      result.severity = "P2";
    } else {
      result.severity = "P3";
    }
  } catch (err) {
    result.notes = `Navigation error: ${err instanceof Error ? err.message.slice(0, 100) : String(err)}`;
    result.severity = "P0";
  }

  return result;
}

// ---------- Lighthouse ----------

async function runLighthouse(url: string, authCookie?: { name: string; value: string }) {
  try {
    const lighthouse = (await import("lighthouse")).default;
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    if (authCookie) {
      await page.setCookie({
        name: authCookie.name,
        value: authCookie.value,
        domain: new URL(BASE_URL).hostname,
        path: "/",
      });
    }

    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    const { report } = await lighthouse(url, {
      port: new URL(browser.wsEndpoint()).port,
      output: "json",
      logLevel: "error",
    });

    await browser.close();
    return JSON.parse(report);
  } catch {
    return null;
  }
}

// ---------- main ----------

async function main() {
  console.log("=== Impjieg Dashboard QA Suite ===\n");
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Started: ${new Date().toISOString()}\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  // ===== LOGGED OUT TESTS =====
  console.log("--- LOGGED OUT ROUTE PROTECTION ---");
  const loggedOutPage = await browser.newPage();
  collectConsoleErrors(loggedOutPage, emptyResult("", ""));
  collectNetworkErrors(loggedOutPage, emptyResult("", ""));

  const loggedOutRoutes = [
    "/candidate/dashboard",
    "/employer/dashboard",
    "/saved-jobs",
    "/admin/dashboard",
  ];

  for (const route of loggedOutRoutes) {
    const result = await testRoute(loggedOutPage, route, "logged-out");
    results.push(result);
    const status = result.loaded ? "⚠ LOADED (should redirect)" : "✓ Redirected";
    console.log(`  ${status} ${route} → ${result.httpStatus} ${result.notes}`);
  }
  await loggedOutPage.close();

  // ===== CANDIDATE TESTS =====
  console.log("\n--- CANDIDATE DASHBOARD ---");
  const candidatePage = await browser.newPage();
  const candidateErrors: string[] = [];
  candidatePage.on("console", (msg) => {
    if (msg.type() === "error") candidateErrors.push(msg.text().slice(0, 150));
  });

  const candidateLoggedIn = await login(candidatePage, CREDENTIALS.candidate.email, CREDENTIALS.candidate.password);
  console.log(`  Login: ${candidateLoggedIn ? "✓ OK" : "✗ FAILED"}`);

  if (candidateLoggedIn) {
    const candidateRoutes = [
      "/candidate/dashboard",
      "/candidate/profile",
      "/candidate/alerts",
      "/candidate/applications",
      "/candidate/recommendations",
      "/saved-jobs",
    ];

    for (const route of candidateRoutes) {
      const result = await testRoute(candidatePage, route, "candidate", { requireAuth: true });
      result.consoleErrors.push(...candidateErrors.filter((e) => !e.includes("schema cache")));
      results.push(result);
      const status = result.loaded ? "✓" : "✗";
      console.log(`  ${status} ${route} → ${result.httpStatus} ${result.notes || "OK"}`);
      if (result.brokenButtons.length) console.log(`    Buttons: ${result.brokenButtons.join("; ")}`);
      if (result.mobileIssues.length) console.log(`    Mobile: ${result.mobileIssues.join("; ")}`);
      if (result.formIssues.length) console.log(`    Forms: ${result.formIssues.join("; ")}`);
    }
  }
  await candidatePage.close();

  // ===== EMPLOYER TESTS =====
  console.log("\n--- EMPLOYER DASHBOARD ---");
  const employerPage = await browser.newPage();
  const employerErrors: string[] = [];
  employerPage.on("console", (msg) => {
    if (msg.type() === "error") employerErrors.push(msg.text().slice(0, 150));
  });

  const employerLoggedIn = await login(employerPage, CREDENTIALS.employer.email, CREDENTIALS.employer.password);
  console.log(`  Login: ${employerLoggedIn ? "✓ OK" : "✗ FAILED"}`);

  if (employerLoggedIn) {
    const employerRoutes = [
      "/employer/dashboard",
      "/employer/jobs",
      "/employer/post-job",
      "/employer/applications",
      "/employer/settings",
      "/employer/bulk-upload",
      "/employer/checkout",
    ];

    for (const route of employerRoutes) {
      const result = await testRoute(employerPage, route, "employer", { requireAuth: true });
      result.consoleErrors.push(...employerErrors.filter((e) => !e.includes("schema cache")));
      results.push(result);
      const status = result.loaded ? "✓" : "✗";
      console.log(`  ${status} ${route} → ${result.httpStatus} ${result.notes || "OK"}`);
      if (result.brokenButtons.length) console.log(`    Buttons: ${result.brokenButtons.join("; ")}`);
      if (result.mobileIssues.length) console.log(`    Mobile: ${result.mobileIssues.join("; ")}`);
      if (result.formIssues.length) console.log(`    Forms: ${result.formIssues.join("; ")}`);
    }

    // Test dynamic routes - get job IDs from /employer/jobs
    try {
      await employerPage.goto(`${BASE_URL}/employer/jobs`, { waitUntil: "networkidle2", timeout: 15000 });
      const jobLinks = await employerPage.$$eval('a[href*="/employer/jobs/"]', (links) =>
        links.map((l) => l.getAttribute("href")).filter((h) => h && h.includes("/jobs/"))
      );
      const uniqueJobIds = [...new Set(jobLinks?.map((h) => h?.split("/")[3]).filter(Boolean))].slice(0, 2);

      for (const jobId of uniqueJobIds) {
        if (jobId) {
          for (const sub of ["/analytics", "/report"]) {
            const route = `/employer/jobs/${jobId}${sub}`;
            const result = await testRoute(employerPage, route, "employer", { requireAuth: true });
            results.push(result);
            const status = result.loaded ? "✓" : "✗";
            console.log(`  ${status} ${route} → ${result.httpStatus} ${result.notes || "OK"}`);
          }
        }
      }
    } catch {
      console.log("  ⚠ Could not test dynamic job routes (no jobs found)");
    }
  }
  await employerPage.close();

  // ===== ADMIN TESTS =====
  console.log("\n--- ADMIN DASHBOARD ---");
  const adminPage = await browser.newPage();
  const adminErrors: string[] = [];
  adminPage.on("console", (msg) => {
    if (msg.type() === "error") adminErrors.push(msg.text().slice(0, 150));
  });

  // Test admin login page
  const adminLoginResult = await testRoute(adminPage, "/admin/login", "admin");
  results.push(adminLoginResult);
  console.log(`  ${adminLoginResult.loaded ? "✓" : "✗"} /admin/login → ${adminLoginResult.httpStatus}`);

  const adminLoggedIn = await loginAsAdminWithMFA(adminPage);
  console.log(`  Login+MFA: ${adminLoggedIn ? "✓ OK" : "✗ FAILED"}`);

  if (adminLoggedIn) {
    const adminRoutes = [
      "/admin/dashboard",
      "/admin/commercial-grants",
      "/admin/jobs",
      "/admin/employers",
      "/admin/candidates",
      "/admin/applications",
      "/admin/payments",
      "/admin/alerts",
      "/admin/subscriptions",
      "/admin/aggregation",
      "/admin/audit-log",
    ];

    for (const route of adminRoutes) {
      const result = await testRoute(adminPage, route, "admin", { requireAuth: true });
      result.consoleErrors.push(...adminErrors.filter((e) => !e.includes("schema cache")));
      results.push(result);
      const status = result.loaded ? "✓" : "✗";
      console.log(`  ${status} ${route} → ${result.httpStatus} ${result.notes || "OK"}`);
      if (result.brokenButtons.length) console.log(`    Buttons: ${result.brokenButtons.join("; ")}`);
      if (result.mobileIssues.length) console.log(`    Mobile: ${result.mobileIssues.join("; ")}`);
      if (result.formIssues.length) console.log(`    Forms: ${result.formIssues.join("; ")}`);
      if (result.consoleErrors.length) console.log(`    Console: ${result.consoleErrors.slice(0, 2).join("; ")}`);
    }
  }
  await adminPage.close();

  await browser.close();

  // ===== SUMMARY =====
  console.log("\n\n=== QA SUMMARY ===\n");

  const p0 = results.filter((r) => r.severity === "P0");
  const p1 = results.filter((r) => r.severity === "P1");
  const p2 = results.filter((r) => r.severity === "P2");
  const p3 = results.filter((r) => r.severity === "P3");

  console.log(`Total routes tested: ${results.length}`);
  console.log(`  P0 (Critical): ${p0.length}`);
  console.log(`  P1 (High):     ${p1.length}`);
  console.log(`  P2 (Medium):   ${p2.length}`);
  console.log(`  P3 (Low):      ${p3.length}`);

  if (p0.length > 0) {
    console.log("\n--- P0 CRITICAL ---");
    for (const r of p0) {
      console.log(`  ${r.url} (${r.account}): ${r.notes}`);
    }
  }

  if (p1.length > 0) {
    console.log("\n--- P1 HIGH ---");
    for (const r of p1) {
      console.log(`  ${r.url} (${r.account}): ${r.notes || r.consoleErrors.join("; ")}`);
    }
  }

  if (p2.length > 0) {
    console.log("\n--- P2 MEDIUM ---");
    for (const r of p2) {
      const issues = [...r.brokenButtons, ...r.mobileIssues, ...r.formIssues].join("; ");
      console.log(`  ${r.url} (${r.account}): ${issues}`);
    }
  }

  console.log(`\nCompleted: ${new Date().toISOString()}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
