import puppeteer from "puppeteer";
(async () => {
  const b = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const p = await b.newPage();
  await p.goto("https://impjieg.vercel.app/auth/signup", { waitUntil: "networkidle2", timeout: 15000 });
  // Select candidate
  for (const btn of await pageButtons(p)) {
    const t = await btn.evaluate((e) => e.textContent || "");
    if (t.includes("Job seeker")) { await btn.click(); break; }
  }
  await p.type('input[name="fullName"]', "Receipt Proof");
  await p.type('input[name="email"]', "bundyglenn@gmail.com");
  await p.type('input[name="password"]', "Proof!2026-Rcpt");
  const terms = await p.waitForSelector("#legal-terms", { timeout: 3000 });
  await terms?.click();
  const priv = await p.waitForSelector("#legal-privacy", { timeout: 3000 });
  await priv?.click();
  await sleep(300);
  await Promise.all([p.click('button[type="submit"]'), p.waitForNavigation({ timeout: 15000 }).catch(() => {})]);
  await sleep(8000);
  const body = await p.evaluate(() => document.body.innerText);
  console.log("Result:", body.includes("check your email") ? "Check-email" : body.substring(0, 100));
  await b.close();
})().catch((e) => { console.error(e.message); process.exit(1); });

async function pageButtons(p: any) { return p.$$("button"); }
function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }
