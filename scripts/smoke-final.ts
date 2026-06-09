import puppeteer from "puppeteer";

const BASE = "https://impjieg.vercel.app";
const EMAIL = `qa.legal.final+${Date.now()}@gmail.com`;
const PASS = "LegalFinal!2026";

async function main() {
  console.log(`=== Final Smoke Test: ${EMAIL} ===\n`);
  const b = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const p = await b.newPage();

  await p.goto(`${BASE}/auth/signup`, { waitUntil: "networkidle2", timeout: 15000 });
  for (const btn of await p.$$("button")) {
    if ((await btn.evaluate(e => e.textContent || "")).includes("Job seeker")) { await btn.click(); break; }
  }
  await p.type('input[name="fullName"]', "Final Smoke Test");
  await p.type('input[name="email"]', EMAIL);
  await p.type('input[name="password"]', PASS);
  await (await p.$("#legal-terms"))?.click();
  await (await p.$("#legal-privacy"))?.click();

  await new Promise(r => setTimeout(r, 300));
  await Promise.all([p.click('button[type="submit"]'), p.waitForNavigation({ timeout: 15000 }).catch(() => {})]);
  await new Promise(r => setTimeout(r, 5000));

  const body = await p.evaluate(() => document.body.innerText);
  console.log(`Result: ${body.includes("check your email") ? "Check-email shown ✅" : body.includes("signed-up") ? "Auto-confirmed ✅" : "Unexpected response"}`);
  await b.close();
  console.log(`\nVerify: SELECT * FROM legal_acceptance_events WHERE email='${EMAIL}'`);
  console.log(`Verify: SELECT * FROM legal_email_receipts r JOIN legal_acceptance_events e ON e.id=r.acceptance_event_id WHERE e.email='${EMAIL}'`);
}

main().catch(e => { console.error(e.message); process.exit(1); });
