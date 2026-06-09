/**
 * Legal Receipt Workflow — Production Smoke Test
 * Run: node --import tsx scripts/smoke-legal.ts
 */

import puppeteer from "puppeteer";

const BASE = "https://impjieg.vercel.app";
const TIMESTAMP = Date.now();
const TEST_EMAIL = `qa.legal.candidate+${TIMESTAMP}@gmail.com`;
const TEST_PASS = "LegalTest!2026-Smoke";

async function main() {
  console.log(`=== Legal Smoke Test ${TIMESTAMP} ===\n`);
  console.log(`Email: ${TEST_EMAIL}\n`);

  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  let failures = 0;

  // =====================================================
  // TEST A: Signup without legal consent
  // =====================================================
  console.log("--- Test A: Signup without Terms/Privacy ---");
  await page.goto(`${BASE}/auth/signup`, { waitUntil: "networkidle2", timeout: 15000 });
  await page.waitForSelector('input[name="email"]', { timeout: 5000 });

  // Select Candidate
  const jobSeekerBtn = await page.$('button:has(svg.lucide-user)');
  if (!jobSeekerBtn) {
    // Try clicking the second account type button
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await btn.evaluate(el => el.textContent);
      if (text?.includes("Job seeker")) {
        await btn.click();
        break;
      }
    }
  } else {
    await jobSeekerBtn.click();
  }

  await page.type('input[name="fullName"]', "Legal Smoke Test");
  await page.type('input[name="email"]', TEST_EMAIL);
  await page.type('input[name="password"]', TEST_PASS);

  const submitBtn = await page.$('button[type="submit"]');
  const disabledNoConsent = await submitBtn!.evaluate(el => el.hasAttribute("disabled"));
  console.log(`  Button disabled without consent: ${disabledNoConsent}`);
  if (!disabledNoConsent) { failures++; console.log("  ❌ FAIL"); }

  // =====================================================
  // TEST B: Signup WITH legal consent
  // =====================================================
  console.log("\n--- Test B: Signup with Terms + Privacy ---");

  // Check Terms
  const termsCheckbox = await page.$("#legal-terms");
  if (termsCheckbox) await termsCheckbox.click();
  else { console.log("  ⚠  #legal-terms not found"); failures++; }

  const privacyCheckbox = await page.$("#legal-privacy");
  if (privacyCheckbox) await privacyCheckbox.click();
  else { console.log("  ⚠  #legal-privacy not found"); failures++; }

  // Verify marketing is NOT checked by default
  const marketingCheckbox = await page.$("#legal-marketing");
  if (marketingCheckbox) {
    const marketingChecked = await marketingCheckbox.evaluate(el => (el as HTMLInputElement).checked);
    console.log(`  Marketing checked by default: ${marketingChecked} (expected false)`);
    if (marketingChecked) { failures++; console.log("  ❌ FAIL"); }
  }

  await new Promise(r => setTimeout(r, 500));

  const btnEnabled = await submitBtn!.evaluate(el => !el.hasAttribute("disabled"));
  console.log(`  Button enabled: ${btnEnabled}`);
  if (!btnEnabled) { failures++; console.log("  ❌ FAIL"); }

  // Submit
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: "networkidle2", timeout: 15000 }).catch(() => {}),
  ]);

  const url = page.url();
  console.log(`  Redirected to: ${url}`);

  if (url.includes("/auth/login") && url.includes("signed-up")) {
    console.log("  ✅ Signup success — redirected to login");
  } else if (url.includes("/auth/signup")) {
    const errText = await page.evaluate(() => {
      const el = document.querySelector('[class*="error"]');
      return el?.textContent || "(no error text)";
    });
    console.log(`  ⚠  Stayed on signup: ${errText}`);
    failures++;
  }

  await browser.close();
  console.log(`\n=== Done: ${failures} failures ===`);
  process.exit(failures > 0 ? 1 : 0);
}

main().catch(err => { console.error(err.message); process.exit(1); });
