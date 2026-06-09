import puppeteer from "puppeteer";

const BASE = "https://impjieg.vercel.app";
const TS = Date.now();
const EMAIL = `qa.legal.e2e+${TS}@gmail.com`;
const PASS = "LegalE2E!2026-Smoke";

async function main() {
  console.log(`=== Legal E2E Smoke Test ===`);
  console.log(`Email: ${EMAIL}\n`);

  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  let failures = 0;

  // 1. Load signup
  await page.goto(`${BASE}/auth/signup`, { waitUntil: "networkidle2", timeout: 15000 });
  console.log("1. Signup page loaded");

  // 2. Select candidate
  const buttons = await page.$$("button");
  for (const btn of buttons) {
    const text = await btn.evaluate((el) => el.textContent || "");
    if (text.includes("Job seeker")) { await btn.click(); break; }
  }
  console.log("2. Selected candidate");

  // 3. Fill form
  await page.type('input[name="fullName"]', "E2E Legal Test");
  await page.type('input[name="email"]', EMAIL);
  await page.type('input[name="password"]', PASS);
  console.log("3. Form filled");

  // 4. Check legal boxes
  const tBox = await page.$("#legal-terms");
  const pBox = await page.$("#legal-privacy");
  if (!tBox || !pBox) { console.log("❌ Missing checkboxes"); process.exit(1); }
  await tBox.click();
  await pBox.click();
  console.log("4. Terms + Privacy checked (marketing left unchecked)");

  await new Promise((r) => setTimeout(r, 300));

  // 5. Submit
  await Promise.all([page.click('button[type="submit"]'), page.waitForNavigation({ waitUntil: "networkidle2", timeout: 15000 }).catch(() => {})]);
  await new Promise((r) => setTimeout(r, 3000));

  const url = page.url();
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log(`5. Post-submit URL: ${url}`);

  if (bodyText.includes("check your email") || bodyText.includes("Check your email")) {
    console.log("   ✅ Check-email message shown");
  } else if (bodyText.includes("signed-up")) {
    console.log("   ✅ Auto-confirmed (signed-up message)");
  } else if (bodyText.toLowerCase().includes("error")) {
    console.log(`   ❌ Error: ${bodyText.substring(0, 200)}`);
    failures++;
  } else {
    console.log(`   ⚠  Unexpected: ${bodyText.substring(0, 200)}`);
  }

  await browser.close();
  console.log(`\n=== Done: ${failures} failures ===`);
  console.log(`\nCheck DB: SELECT * FROM legal_acceptance_events WHERE email = '${EMAIL}';`);
  console.log(`Check DB: SELECT * FROM legal_email_receipts WHERE id IN (SELECT id FROM legal_email_receipts WHERE recipient_email = '${EMAIL}');`);
}

main().catch((err) => { console.error(err.message); process.exit(1); });
