import { chromium } from 'playwright';

async function run() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    const type = msg.type();
    console.log(`[CONSOLE ${type.toUpperCase()}] ${msg.text()}`);
  });
  
  page.on('pageerror', err => {
    console.log('[PAGE ERROR]', err.stack || err.message);
  });
  
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('supabase') || url.includes('rest/v1')) {
      console.log(`HTTP ${response.status()} ${response.statusText()}: ${url}`);
      try {
        if (response.status() >= 400) {
          const text = await response.text();
          console.log(`  Response body:`, text);
        }
      } catch (_e) {
        // ignore
      }
    }
  });

  console.log('Navigating to login page...');
  await page.goto('https://impjieg.vercel.app/auth/login');
  
  console.log('Filling credentials...');
  await page.fill('input[name="email"]', 'bundyglenn@gmail.com');
  await page.fill('input[name="password"]', 'Floyd420!');
  
  console.log('Submitting form...');
  await page.click('button[type="submit"]');

  console.log('Waiting for redirection...');
  try {
    await page.waitForURL('**/employer/dashboard', { timeout: 15000 });
    console.log('Redirected successfully to:', page.url());
  } catch (_err) {
    console.log('Failed to redirect to dashboard. Current URL:', page.url());
  }
  
  console.log('Waiting 5 seconds for page to settle and fetch data...');
  await page.waitForTimeout(5000);
  
  console.log('Page title:', await page.title());
  
  const content = await page.content();
  console.log('--- Page DOM Summary ---');
  if (content.includes('Welcome back')) {
    console.log('Found "Welcome back" in the HTML!');
  } else {
    console.log('Did NOT find "Welcome back" in the HTML.');
  }
  
  if (content.includes('Unable to load your employer profile')) {
    console.log('Found "Unable to load your employer profile" in the HTML!');
  }
  
  const mainHTML = await page.locator('main').first().innerHTML().catch(() => 'No main element found');
  console.log('Main element inner HTML:', mainHTML);
  
  console.log('Closing browser...');
  await browser.close();
}

run().catch(console.error);
