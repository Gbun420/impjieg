import { chromium } from "playwright";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const OUTPUT_DIR = process.env.AUDIT_DIR || ".";
const SCREENSHOTS_DIR = join(OUTPUT_DIR, "screenshots");
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const BASE_URL = "http://localhost:3000";

const VIEWPORTS = [
  { name: "320x568", width: 320, height: 568 },
  { name: "375x812", width: 375, height: 812 },
  { name: "768x1024", width: 768, height: 1024 },
  { name: "1280x800", width: 1280, height: 800 },
  { name: "1440x900", width: 1440, height: 900 },
  { name: "1920x1080", width: 1920, height: 1080 },
];

const THEMES = ["light", "dark"];

const ROUTES = [
  { path: "/", name: "homepage" },
  { path: "/jobs", name: "jobs" },
  { path: "/companies", name: "companies-list" },
  { path: "/companies/new-employer-4qy9", name: "company-profile" },
  { path: "/pricing", name: "pricing" },
  { path: "/salary-calculator", name: "salary-calculator" },
  { path: "/contact", name: "contact" },
  { path: "/auth/login", name: "login" },
  { path: "/auth/signup", name: "signup" },
  { path: "/privacy", name: "privacy" },
  { path: "/terms", name: "terms" },
  { path: "/jobs?q=zzzzzzzzzzzzzz", name: "jobs-empty-search" },
];

const issues = [];
const allConsoleLogs = [];
const allNetworkErrors = [];

function logIssue(severity, route, viewport, theme, problem, why, fix, component) {
  issues.push({
    severity, route, viewport, theme, problem,
    whyItMatters: why, recommendedFix: fix,
    likelyFile: component, timestamp: new Date().toISOString(),
  });
}

async function auditRoute(page, route, viewport, theme) {
  const vpName = viewport.name;
  const pageErrors = [];
  const netErrors = [];

  await page.setViewportSize({ width: viewport.width, height: viewport.height });

  if (theme === "dark") {
    await page.evaluate(() => document.documentElement.classList.add("dark"));
  } else {
    await page.evaluate(() => document.documentElement.classList.remove("dark"));
  }

  const onConsole = (msg) => {
    if (msg.type() === "error") pageErrors.push(msg.text());
  };
  const onResponse = (resp) => {
    if (resp.status() >= 400 && !resp.url().includes("/api/")) {
      netErrors.push({ url: resp.url(), status: resp.status() });
    }
  };
  page.on("console", onConsole);
  page.on("response", onResponse);

  let loadOk = false;
  let finalUrl = route.path;

  try {
    const resp = await page.goto(`${BASE_URL}${route.path}`, {
      waitUntil: "networkidle", timeout: 15000,
    });
    finalUrl = page.url();
    loadOk = resp?.ok() ?? false;
    if (!resp?.ok() && resp?.status()) {
      logIssue("P1", route.path, vpName, theme,
        `HTTP ${resp.status()}`, `Status ${resp.status()}`, "Check SSR/auth", route.path);
    }
  } catch (err) {
    logIssue("P0", route.path, vpName, theme,
      `Load failed: ${err.message}`, "Page did not load", "Check route/server", route.path);
  }

  await page.waitForTimeout(800);

  const ssPath = join(SCREENSHOTS_DIR, `${route.name}--${vpName}--${theme}.png`);
  try {
    await page.screenshot({ path: ssPath, fullPage: true });
  } catch (e) {
    logIssue("P1", route.path, vpName, theme,
      `Screenshot failed: ${e.message}`, "Cannot capture", "Check rendering", route.path);
  }

  const checks = await page.evaluate(() => {
    const doc = document.documentElement;
    const r = {};
    r.hScroll = doc.scrollWidth > doc.clientWidth;
    r.sw = doc.scrollWidth;
    r.cw = doc.clientWidth;
    r.brokenImgs = [...document.querySelectorAll("img")]
      .filter(i => !i.complete || i.naturalWidth === 0)
      .map(i => ({ src: i.src, alt: i.alt }));
    r.h1Count = document.querySelectorAll("h1").length;
    r.headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")]
      .slice(0, 8).map(h => ({ tag: h.tagName, text: h.textContent?.trim().slice(0, 50) }));
    r.btnsNoLabel = [...document.querySelectorAll("button")]
      .filter(b => !b.textContent?.trim() && !b.getAttribute("aria-label"))
      .map(b => b.outerHTML.slice(0, 80));
    r.linksNoLabel = [...document.querySelectorAll("a")]
      .filter(a => !a.textContent?.trim() && !a.getAttribute("aria-label") && !a.querySelector("img[alt]"))
      .slice(0, 5).map(a => ({ href: a.href, html: a.outerHTML.slice(0, 80) }));
    r.fixedEls = [...document.querySelectorAll("*")]
      .filter(el => { const s = getComputedStyle(el); return s.position === "fixed" || s.position === "sticky"; })
      .slice(0, 5).map(el => ({ tag: el.tagName, cls: el.className?.toString().slice(0, 60), pos: getComputedStyle(el).position }));
    r.bodyHeight = document.body.scrollHeight;
    return r;
  });

  if (checks.hScroll) {
    logIssue("P1", route.path, vpName, theme,
      `Horizontal scroll: ${checks.sw} > ${checks.cw}`,
      "Content overflows viewport", "Fix overflow/max-width", route.path);
  }
  for (const img of checks.brokenImgs) {
    logIssue("P1", route.path, vpName, theme,
      `Broken image: ${img.src}`, "Image failed to load", "Check URL/format", route.path);
  }
  if (checks.h1Count === 0) {
    logIssue("P2", route.path, vpName, theme,
      "No H1 heading", "SEO/a11y issue", "Add H1", route.path);
  }
  if (checks.h1Count > 1) {
    logIssue("P2", route.path, vpName, theme,
      `Multiple H1s (${checks.h1Count})`, "SEO issue", "Use single H1", route.path);
  }
  for (const b of checks.btnsNoLabel) {
    logIssue("P2", route.path, vpName, theme,
      `Button without label: ${b}`, "a11y: screen readers can't identify", "Add aria-label or text", route.path);
  }

  for (const err of pageErrors) {
    allConsoleLogs.push({ route: route.path, viewport: vpName, theme, error: err });
    if (err.includes("Hydration") || err.includes("hydration")) {
      logIssue("P1", route.path, vpName, theme,
        `Hydration mismatch: ${err.slice(0, 120)}`, "Server/client mismatch", "Check client components", route.path);
    } else if (!err.includes("favicon") && !err.includes("404")) {
      logIssue("P2", route.path, vpName, theme,
        `Console error: ${err.slice(0, 120)}`, "Browser error", "Investigate", route.path);
    }
  }
  for (const ne of netErrors) {
    allNetworkErrors.push({ route: route.path, viewport: vpName, theme, ...ne });
    if (ne.status === 404 && !ne.url.includes("favicon")) {
      logIssue("P2", route.path, vpName, theme,
        `404: ${ne.url}`, "Missing resource", "Fix URL", route.path);
    }
  }

  page.off("console", onConsole);
  page.off("response", onResponse);

  return { loadOk, finalUrl, checks };
}

async function main() {
  console.log("Starting Impjieg visual audit...");
  console.log(`Output: ${OUTPUT_DIR}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  let jobSlug = null;

  for (const theme of THEMES) {
    for (const viewport of VIEWPORTS) {
      console.log(`\n--- ${viewport.name} / ${theme} ---`);
      for (const route of ROUTES) {
        const shortVp = viewport.name.split("x")[0];
        process.stdout.write(`  ${route.name}... `);
        const result = await auditRoute(page, route, viewport, theme);
        console.log(result.loadOk ? "OK" : `FAIL (${result.finalUrl})`);

        if (route.name === "jobs" && theme === "light" && viewport.name === "1440x900" && !jobSlug) {
          try {
            const jobLink = await page.$('a[href*="/jobs/"]');
            if (jobLink) {
              const href = await jobLink.getAttribute("href");
              if (href && href.split("/").length >= 4) {
                jobSlug = href;
              }
            }
          } catch (e) {}
        }
      }

      if (jobSlug) {
        process.stdout.write(`  job-detail... `);
        const result = await auditRoute(page, { path: jobSlug, name: "job-detail" }, viewport, theme);
        console.log(result.loadOk ? "OK" : `FAIL`);
      }
    }
  }

  await browser.close();

  writeFileSync(join(OUTPUT_DIR, "issues.json"), JSON.stringify(issues, null, 2));
  writeFileSync(join(OUTPUT_DIR, "console-logs.json"), JSON.stringify(allConsoleLogs, null, 2));
  writeFileSync(join(OUTPUT_DIR, "network-errors.json"), JSON.stringify(allNetworkErrors, null, 2));

  const p0 = issues.filter(i => i.severity === "P0");
  const p1 = issues.filter(i => i.severity === "P1");
  const p2 = issues.filter(i => i.severity === "P2");
  const p3 = issues.filter(i => i.severity === "P3");

  let report = `# Impjieg Visual Audit\n\n`;
  report += `**Date:** ${new Date().toISOString()}\n`;
  report += `**Routes audited:** ${ROUTES.length}\n`;
  report += `**Viewports:** ${VIEWPORTS.length}\n`;
  report += `**Themes:** ${THEMES.length}\n`;
  report += `**Total screenshots:** ~(up to ${ROUTES.length * VIEWPORTS.length * THEMES.length})\n\n`;

  report += `## Executive Summary\n\n`;
  report += `| Severity | Count |\n|----------|-------|\n`;
  report += `| P0 (Blocker) | ${p0.length} |\n`;
  report += `| P1 (Serious) | ${p1.length} |\n`;
  report += `| P2 (Polish) | ${p2.length} |\n`;
  report += `| P3 (Minor) | ${p3.length} |\n`;
  report += `| **Total** | **${issues.length}** |\n\n`;

  if (p0.length > 0) {
    report += `## P0 Blockers\n\n`;
    for (const i of p0) {
      report += `- **${i.route}** (${i.viewport}/${i.theme}): ${i.problem}\n`;
      report += `  - Why: ${i.whyItMatters}\n`;
      report += `  - Fix: ${i.recommendedFix}\n\n`;
    }
  }

  if (p1.length > 0) {
    report += `## P1 Serious Issues\n\n`;
    for (const i of p1) {
      report += `- **${i.route}** (${i.viewport}/${i.theme}): ${i.problem}\n`;
      report += `  - Why: ${i.whyItMatters}\n`;
      report += `  - Fix: ${i.recommendedFix}\n\n`;
    }
  }

  if (p2.length > 0) {
    report += `## P2 Polish Issues\n\n`;
    report += `*${p2.length} issues found. See issues.json for full details.*\n\n`;
    const byRoute = {};
    for (const i of p2) {
      byRoute[i.route] = (byRoute[i.route] || 0) + 1;
    }
    for (const [route, count] of Object.entries(byRoute)) {
      report += `- **${route}**: ${count} issues\n`;
    }
    report += `\n`;
  }

  report += `## Console Errors\n\n`;
  report += `*${allConsoleLogs.length} console errors captured. See console-logs.json.*\n\n`;

  report += `## Network Errors\n\n`;
  report += `*${allNetworkErrors.length} network errors captured. See network-errors.json.*\n\n`;

  report += `## Screenshots\n\n`;
  report += `Saved to: \`screenshots/\`\n\n`;
  report += `Naming: \`{route}--{viewport}--{theme}.png\`\n`;

  writeFileSync(join(OUTPUT_DIR, "report.md"), report);
  console.log(`\nAudit complete. ${issues.length} issues found.`);
  console.log(`Report: ${join(OUTPUT_DIR, "report.md")}`);
}

main().catch(console.error);
