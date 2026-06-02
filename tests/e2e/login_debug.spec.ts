import { test } from '@playwright/test';

test('debug login flow', async ({ page }) => {
  page.on('console', msg => {
    const type = msg.type();
    console.log(`[CONSOLE ${type.toUpperCase()}] ${msg.text()}`);
  });
  
  page.on('pageerror', err => {
    console.log('[PAGE ERROR]', err.message);
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
      } catch {
        // ignore
      }
    }
  });

  console.log('Navigating to login page...');
  await page.goto('https://impjieg.vercel.app/auth/login');
  
  console.log('Filling form...');
  await page.fill('input[name="email"]', 'bundyglenn@gmail.com');
  await page.fill('input[name="password"]', 'Floyd420!');
  
  console.log('Submitting...');
  await page.click('button[type="submit"]');

  console.log('Waiting for URL change...');
  try {
    await page.waitForURL('**/employer/dashboard', { timeout: 10000 });
    console.log('Success! Redirected to:', page.url());
  } catch {
    console.log('Redirect failed. Current URL:', page.url());
  }
  
  console.log('Waiting for queries to resolve...');
  await page.waitForTimeout(5000);
});
