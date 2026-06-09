import puppeteer from "puppeteer";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  page.on("console", (msg) => {
    if (msg.type() === "log" || msg.type() === "error") {
      console.log("  [browser]", msg.text().slice(0, 200));
    }
  });

  console.log("1. Navigating to admin login...");
  await page.goto("https://impjieg.vercel.app/admin/login", {
    waitUntil: "networkidle2",
    timeout: 15000,
  });

  console.log("2. Filling email...");
  await page.waitForSelector('input[name="email"]', { timeout: 5000 });
  await page.type('input[name="email"]', "qa.admin+dashboard@impjieg.test", { delay: 5 });

  console.log("3. Filling password...");
  await page.type('input[name="password"]', "ImpjiegQA!2026-DoNotUseReal", { delay: 5 });

  console.log("4. Clicking submit...");
  // Try dispatching form submit event directly
  const submitted = await page.evaluate(() => {
    const form = document.querySelector("form");
    if (form) {
      // Dispatch submit event
      const event = new Event("submit", { bubbles: true, cancelable: true });
      form.dispatchEvent(event);
      return "form submit dispatched";
    }
    return "no form found";
  });
  console.log("   Submit result:", submitted);

  // Wait longer and check for any response
  for (let i = 0; i < 10; i++) {
    await sleep(1000);
    const url = page.url();
    const bodySnippet = await page.evaluate(() => {
      const errorEl = document.querySelector('[role="alert"], [class*="error"]');
      return errorEl?.textContent?.trim()?.slice(0, 100) || "no error";
    });
    console.log(`   Tick ${i + 1}: URL=${url}, error=${bodySnippet}`);

    if (!url.includes("/admin/login")) {
      console.log("   Navigation detected!");
      break;
    }
  }

  console.log("5. Current URL:", page.url());

  const cookies = await page.cookies();
  console.log(
    "6. Cookies:",
    cookies.map((c) => `${c.name}=${c.value.slice(0, 30)}...`).join(", ")
  );

  if (page.url().includes("/mfa")) {
    console.log("7. On MFA page, generating TOTP...");
    const { execSync } = await import("node:child_process");
    const totp = execSync("npx tsx scripts/generate-admin-qa-totp.ts", {
      cwd: process.cwd(),
      encoding: "utf-8",
      timeout: 15000,
    });
    const code = totp.match(/\d{6}/)?.[0];
    console.log("   TOTP code:", code);

    if (code) {
      // Find TOTP input using evaluate
      const inputSelector = await page.evaluate(() => {
        const inputs = document.querySelectorAll("input");
        for (const input of inputs) {
          if (
            input.name === "code" ||
            input.getAttribute("inputmode") === "numeric" ||
            input.maxLength === 6
          ) {
            return `input[name="${input.name}"]` || `#${input.id}` || "input[type='text']";
          }
        }
        // Fallback: find the last text input
        const lastInput = inputs[inputs.length - 1];
        return lastInput ? `#${lastInput.id}` || `input[name="${lastInput.name}"]` : null;
      });

      console.log("   Input selector:", inputSelector);

      if (inputSelector) {
        await page.type(inputSelector, code, { delay: 30 });
        await page.click('button[type="submit"]');
        await sleep(4000);
        console.log("8. After MFA URL:", page.url());

        const cookies2 = await page.cookies();
        console.log(
          "9. Cookies after MFA:",
          cookies2.map((c) => `${c.name}=${c.value.slice(0, 30)}...`).join(", ")
        );

        // Try navigating to dashboard
        console.log("10. Navigating to /admin/dashboard...");
        await page.goto("https://impjieg.vercel.app/admin/dashboard", {
          waitUntil: "networkidle2",
          timeout: 15000,
        });
        console.log("11. Dashboard URL:", page.url());

        const cookies3 = await page.cookies();
        console.log(
          "12. Cookies at dashboard:",
          cookies3.map((c) => `${c.name}=${c.value.slice(0, 30)}...`).join(", ")
        );

        // Check page content
        const title = await page.title();
        console.log("13. Page title:", title);

        const bodyText = await page.evaluate(() => document.body?.textContent?.slice(0, 300) || "");
        console.log("14. Body text:", bodyText);
      }
    }
  } else {
    console.log("7. Not on MFA page. URL:", page.url());
    const bodyText = await page.evaluate(() => document.body?.textContent?.slice(0, 300) || "");
    console.log("8. Body text:", bodyText);
  }

  await browser.close();
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
